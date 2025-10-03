package tn.esprit.examen.nomPrenomClasseExamen.services;

import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.examen.nomPrenomClasseExamen.dto.MessageDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.ChatRoom;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Message;
import tn.esprit.examen.nomPrenomClasseExamen.entities.UserEntity;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.ChatRoomRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.MessageRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.UserRepository;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@AllArgsConstructor
@Service
public class ChatServiceImpl implements IChat {

    private static final Logger log = LoggerFactory.getLogger(ChatServiceImpl.class);

    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private final SimpleDateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");

    private boolean isUserInChatRoom(Long chatRoomId, String userId) {
        boolean isPresent = chatRoomRepository.existsByIdAndUsersId(chatRoomId, userId);
        log.debug("User {} is {} in chat room {}", userId, isPresent ? "present" : "not present", chatRoomId);
        return isPresent;
    }

    private ChatRoom privateChatRoomExists(String userId1, String userId2) {
        UserEntity user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId1));
        UserEntity user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId2));
        ChatRoom chatRoom = chatRoomRepository.findByUsersContainingAndUsersContainingAndNameIsNull(user1, user2)
                .orElse(null);
        log.debug("Private chat room between users {} and {}: {}", userId1, userId2, chatRoom != null ? "exists" : "does not exist");
        return chatRoom;
    }

    @Override
    public MessageDTO saveMessage(Long channelId, Message message) {
        ChatRoom chatRoom = chatRoomRepository.findById(channelId)
                .orElseThrow(() -> new RuntimeException("Chat room not found: " + channelId));
        if (!isUserInChatRoom(channelId, message.getSender().getId())) {
            log.info("User {} is not in chat room {}, joining them", message.getSender().getId(), channelId);
            this.joinChatRoom(channelId, message.getSender().getId());
        }
        message.setChatRoom(chatRoom);
        Message savedMessage = messageRepository.save(message);
        log.info("Saved message ID {} for chat room {}", savedMessage.getId(), channelId);

        MessageDTO messageDTO = new MessageDTO();
        messageDTO.setId(savedMessage.getId());
        messageDTO.setChatRoomId(savedMessage.getChatRoom().getId());
        messageDTO.setChatRoomName(savedMessage.getChatRoom().getName());
        messageDTO.setSenderId(savedMessage.getSender().getId());
        messageDTO.setSenderUsername(savedMessage.getSender().getUsername());
        messageDTO.setContent(savedMessage.getContent());
        messageDTO.setAttachment(savedMessage.getAttachment() != null ? Base64.getEncoder().encodeToString(savedMessage.getAttachment()) : null);
        messageDTO.setCreatedAt(dateFormatter.format(savedMessage.getCreatedAt()));
        messageDTO.setSeen(savedMessage.isSeen());

        return messageDTO;
    }

    @Override
    public void sendMessage(Long channelId, Message message) {
        MessageDTO msgDTO = this.saveMessage(channelId, message);
        log.info("Sending message to /room/messages/{}: {}", channelId, msgDTO);
        messagingTemplate.convertAndSend("/room/messages/" + channelId, msgDTO);
    }

    @Override
    public void sendPrivateMessage(String senderId, String receiverId, Message message) {
        UserEntity sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found: " + senderId));
        UserEntity receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found: " + receiverId));
        ChatRoom chatRoom = privateChatRoomExists(senderId, receiverId);
        if (chatRoom == null) {
            log.info("Creating new private chat room between users {} and {}", senderId, receiverId);
            chatRoom = ChatRoom.builder()
                    .name(null)
                    .users(new ArrayList<>())
                    .build();
            chatRoom = chatRoomRepository.save(chatRoom);
            this.joinChatRoom(chatRoom.getId(), senderId);
            this.joinChatRoom(chatRoom.getId(), receiverId);
        }
        message.setChatRoom(chatRoom);
        message.setSender(sender);
        Message savedMessage = messageRepository.save(message);
        MessageDTO messageDTO = new MessageDTO();
        messageDTO.setId(savedMessage.getId());
        messageDTO.setChatRoomId(savedMessage.getChatRoom().getId());
        messageDTO.setChatRoomName(savedMessage.getChatRoom().getName());
        messageDTO.setSenderId(savedMessage.getSender().getId());
        messageDTO.setSenderUsername(savedMessage.getSender().getUsername());
        messageDTO.setContent(savedMessage.getContent());
        messageDTO.setAttachment(savedMessage.getAttachment() != null ? Base64.getEncoder().encodeToString(savedMessage.getAttachment()) : null);
        messageDTO.setCreatedAt(dateFormatter.format(savedMessage.getCreatedAt()));
        messageDTO.setSeen(savedMessage.isSeen());

        log.info("Sending private message to /room/messages/{}: {}", chatRoom.getId(), messageDTO);
        messagingTemplate.convertAndSend("/room/messages/" + chatRoom.getId(), messageDTO);
    }

    @Override
    public void markAsRead(Long messageId) {
        Optional<Message> msg = messageRepository.findById(messageId);
        msg.ifPresent(message -> {
            message.setSeen(true);
            messageRepository.save(message);
            log.info("Marked message ID {} as read, broadcasting to /room/messages/{}", messageId, message.getChatRoom().getId());
            MessageDTO messageDTO = new MessageDTO();
            messageDTO.setId(message.getId());
            messageDTO.setChatRoomId(message.getChatRoom().getId());
            messageDTO.setChatRoomName(message.getChatRoom().getName());
            messageDTO.setSenderId(message.getSender().getId());
            messageDTO.setSenderUsername(message.getSender().getUsername());
            messageDTO.setContent(message.getContent());
            messageDTO.setAttachment(message.getAttachment() != null ? Base64.getEncoder().encodeToString(message.getAttachment()) : null);
            messageDTO.setCreatedAt(dateFormatter.format(message.getCreatedAt()));
            messageDTO.setSeen(message.isSeen());

            messagingTemplate.convertAndSend("/room/messages/" + message.getChatRoom().getId(), messageDTO);
        });
    }

    @Override
    public void deleteMessage(Long id) {
        log.info("Deleting message ID {}", id);
        messageRepository.deleteById(id);
    }

    @Override
    public List<Message> getLastMessage(List<ChatRoom> chatRooms) {
        List<Message> messages = new ArrayList<>();
        for (ChatRoom chatRoom : chatRooms) {
            messageRepository.findTopByChatRoomOrderByCreatedAtDesc(chatRoom)
                    .ifPresent(messages::add);
        }
        log.debug("Retrieved last messages for {} chat rooms: {}", chatRooms.size(), messages.size());
        return messages;
    }

    @Override
    public List<Message> getLastMessage1(List<ChatRoom> chatRooms) {
        List<Message> messages = new ArrayList<>();
        for (ChatRoom chatRoom : chatRooms) {
            List<Message> roomMessages = messageRepository.findByChatRoomOrderByCreatedAtDesc(chatRoom);
            if (!roomMessages.isEmpty()) {
                messages.add(roomMessages.get(0));
            }
        }
        log.debug("Retrieved last messages (method 1) for {} chat rooms: {}", chatRooms.size(), messages.size());
        return messages;
    }

    private ChatRoom roomNamer(ChatRoom chatRoom, UserEntity user) {
        if (chatRoom.getName() == null) {
            UserEntity otherUser = chatRoom.getUsers().stream()
                    .filter(u -> !u.getId().equals(user.getId()))
                    .findFirst()
                    .orElse(null);
            if (otherUser != null) {
                chatRoom.setName(otherUser.getUsername());
                log.debug("Renamed chat room {} to {}", chatRoom.getId(), chatRoom.getName());
            } else {
                chatRoom.setName("Chat " + chatRoom.getId());
                log.debug("No other users in chat room {}, assigned default name: {}", chatRoom.getId(), chatRoom.getName());
            }
        }
        return chatRoom;
    }

    @Override
    public List<ChatRoom> getRooms(String userId) {
        log.info("Fetching rooms for userId: {}", userId);
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        log.info("User found: {}", user.getId());
        List<ChatRoom> chatRooms = chatRoomRepository.findByUsersContaining(user);
        log.info("Found {} chat rooms for user {}", chatRooms.size(), userId);
        chatRooms.forEach(chatRoom -> roomNamer(chatRoom, user));
        log.info("Retrieved {} chat rooms for user {}", chatRooms.size(), userId);
        return chatRooms;
    }

    @Override
    public ChatRoom createChatRoom(ChatRoom chatRoom, UserEntity authed, List<String> userIdsToAdd) {
        chatRoom.setUsers(new ArrayList<>());
        chatRoom.getUsers().add(authed);
        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);
        log.info("Created chat room ID {} for user {}", savedChatRoom.getId(), authed.getId());

        if (userIdsToAdd != null && !userIdsToAdd.isEmpty()) {
            for (String userId : userIdsToAdd) {
                if (!userId.equals(authed.getId())) {
                    try {
                        joinChatRoom(savedChatRoom.getId(), userId);
                    } catch (RuntimeException e) {
                        log.warn("Failed to add user {} to chat room {}: {}", userId, savedChatRoom.getId(), e.getMessage());
                    }
                }
            }
        }
        return savedChatRoom;
    }

    @Override
    public void joinChatRoom(Long chatRoomId, String userId) {
        if (!isUserInChatRoom(chatRoomId, userId)) {
            ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                    .orElseThrow(() -> new RuntimeException("Chat room not found: " + chatRoomId));
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));
            chatRoom.getUsers().add(user);
            chatRoomRepository.save(chatRoom);
            log.info("User {} joined chat room {}", userId, chatRoomId);
        }
    }

    @Override
    @Transactional
    public void leaveChatRoom(Long chatRoomId, String userId) {
        if (isUserInChatRoom(chatRoomId, userId)) {
            ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                    .orElseThrow(() -> new RuntimeException("Chat room not found: " + chatRoomId));
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));
            chatRoom.getUsers().remove(user);
            chatRoomRepository.save(chatRoom);
            log.info("User {} left chat room {}", userId, chatRoomId);

            if (chatRoom.getUsers().isEmpty()) {
                log.info("Chat room {} is empty, deleting it", chatRoomId);
                messageRepository.deleteByChatRoom(chatRoom);
                chatRoomRepository.deleteById(chatRoomId);
            }
        }
    }

    @Override
    @Transactional
    public ChatRoom editChatRoom(ChatRoom chatRoom) {
        if (chatRoom == null || chatRoom.getId() == null) {
            log.error("Invalid chat room data for edit: {}", chatRoom);
            throw new IllegalArgumentException("Chat room and ID must not be null");
        }
        ChatRoom existingChatRoom = chatRoomRepository.findById(chatRoom.getId())
                .orElseThrow(() -> new RuntimeException("Chat room not found: " + chatRoom.getId()));

        log.info("Editing chat room ID {} with data: {}", chatRoom.getId(), chatRoom);

        if (chatRoom.getName() != null) {
            existingChatRoom.setName(chatRoom.getName());
        }
        if (chatRoom.getTeamid() != null) {
            existingChatRoom.setTeamid(chatRoom.getTeamid());
        }
        if (chatRoom.getUsers() != null) {
            existingChatRoom.setUsers(new ArrayList<>(chatRoom.getUsers()));
        }

        ChatRoom updatedChatRoom = chatRoomRepository.save(existingChatRoom);
        log.info("Updated chat room ID {}", updatedChatRoom.getId());
        return updatedChatRoom;
    }

    @Override
    @Transactional
    public void deleteChatRoom(Long id) {
        try {
            log.info("Deleting chat room ID {}", id);
            ChatRoom chatRoom = chatRoomRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Chat room not found: " + id));
            messageRepository.deleteByChatRoom(chatRoom);
            chatRoomRepository.deleteById(id);
            log.info("Successfully deleted chat room ID {}", id);
        } catch (Exception e) {
            log.error("Failed to delete chat room ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to delete chat room: " + e.getMessage(), e);
        }
    }

    @Override
    public List<Message> getMessagesFrom(ChatRoom chatRoom, Long messageId) {
        List<Message> messages = messageRepository.findTop10ByChatRoomAndIdLessThanEqualOrderByCreatedAtDesc(chatRoom, messageId);
        log.debug("Retrieved {} messages from chat room {} starting from message ID {}", messages.size(), chatRoom.getId(), messageId);
        return messages;
    }

    @Override
    public List<Message> getMessagesFrom1(ChatRoom chatRoom) {
        List<Message> messages = messageRepository.findByChatRoomOrderByCreatedAtDesc(chatRoom);
        log.debug("Retrieved {} messages from chat room {}", messages.size(), chatRoom.getId());
        return messages;
    }

    @Override
    public List<Message> getLast10MessageStartingFrom(ChatRoom chatRoom, Long messageId) {
        List<Message> messages = messageRepository.findTop10ByChatRoomAndIdLessThanEqualOrderByCreatedAtDesc(chatRoom, messageId);
        log.debug("Retrieved last 10 messages from chat room {} starting from message ID {}: {}", chatRoom.getId(), messageId, messages.size());
        return messages;
    }

    @Override
    public List<UserEntity> getAllUsers() {
        List<UserEntity> users = userRepository.findAll();
        log.info("Fetched {} users", users.size());
        return users;
    }
}