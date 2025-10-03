package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.user.SimpUser;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.dto.ChatRoomCreationRequest;
import tn.esprit.examen.nomPrenomClasseExamen.dto.ChatRoomDTO;
import tn.esprit.examen.nomPrenomClasseExamen.dto.MessageDTO;
import tn.esprit.examen.nomPrenomClasseExamen.dto.MessageRequest;
import tn.esprit.examen.nomPrenomClasseExamen.entities.ChatRoom;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Message;
import tn.esprit.examen.nomPrenomClasseExamen.entities.UserEntity;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.UserRepository;
import tn.esprit.examen.nomPrenomClasseExamen.services.IChat;

import java.security.Principal;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/chat")
@Slf4j
@CrossOrigin(origins = "http://localhost:4200")
public class MessageController {

    private final IChat chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final SimpUserRegistry userRegistry;
    private final UserRepository userRepository;

    private final SimpleDateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");

    private UserEntity getAuthenticatedUser(Principal principal) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() != null) {
            Object authPrincipal = authentication.getPrincipal();
            log.info("Authentication found in SecurityContext: {}", authPrincipal);
            if (authPrincipal instanceof Jwt jwt) {
                String userId = jwt.getSubject();
                log.info("Authenticated user ID from SecurityContext: {}", userId);
                return chatService.getAllUsers().stream()
                        .filter(user -> user.getId().equals(userId))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Authenticated user not found in database: " + userId));
            }
        }

        if (principal != null) {
            String userId = principal.getName();
            log.info("Falling back to WebSocket Principal, user ID: {}", userId);
            return chatService.getAllUsers().stream()
                    .filter(user -> user.getId().equals(userId))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("User not found in database: " + userId));
        }

        log.warn("No authentication found in SecurityContext or Principal, checking SimpUserRegistry");
        for (SimpUser user : userRegistry.getUsers()) {
            log.info("Connected user: {}", user.getName());
            return chatService.getAllUsers().stream()
                    .filter(u -> u.getId().equals(user.getName()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Connected user not found in database: " + user.getName()));
        }

        log.error("No authenticated user found in SecurityContext, Principal, or SimpUserRegistry");
        throw new RuntimeException("No authenticated user found");
    }

    @GetMapping("/rooms")
    public ResponseEntity<?> getChatRooms() {
        try {
            String userId = getAuthenticatedUser(null).getId();
            log.info("Fetching chat rooms for user: {}", userId);
            List<ChatRoom> chatRooms = chatService.getRooms(userId);
            log.info("Fetched {} chat rooms for user: {}", chatRooms.size(), userId);
            return ResponseEntity.ok(chatRooms);
        } catch (Exception e) {
            log.error("Error fetching chat rooms: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch chat rooms: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/rooms/last")
    public ResponseEntity<?> getLastMessages(@RequestParam List<Long> chatRoomIds) {
        try {
            log.info("Fetching last messages for chat rooms: {}", chatRoomIds);
            List<ChatRoom> chatRooms = chatRoomIds.stream()
                    .map(id -> chatService.getRooms(getAuthenticatedUser(null).getId()).stream()
                            .filter(room -> room.getId().equals(id))
                            .findFirst()
                            .orElseThrow(() -> new RuntimeException("Chat room not found: " + id)))
                    .toList();
            List<Message> lastMessages = chatService.getLastMessage1(chatRooms);
            log.info("Fetched last messages for {} chat rooms", chatRoomIds.size());
            return ResponseEntity.ok(lastMessages);
        } catch (Exception e) {
            log.error("Error fetching last messages: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch last messages: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping(value = "/send", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> sendMessage(@RequestBody MessageRequest msg) {
        try {
            UserEntity sender = getAuthenticatedUser(null);
            log.info("Received HTTP request to send message in chat room {} by user {}", msg.getChatRoomId(), sender.getId());
            Message message = Message.builder()
                    .sender(sender)
                    .content(msg.getMessage())
                    .createdAt(new Date())
                    .seen(false)
                    .build();
            chatService.sendMessage(msg.getChatRoomId(), message);
            log.info("Message sent successfully in chat room {}", msg.getChatRoomId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error sending message: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to send message: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @MessageMapping("/send")
    public void sendMessageWS(@Payload MessageRequest msg, Principal principal) {
        log.info("Received WebSocket message: {} for chat room: {}", msg.getMessage(), msg.getChatRoomId());
        UserEntity sender = getAuthenticatedUser(principal);
        Message message = Message.builder()
                .sender(sender)
                .content(msg.getMessage())
                .createdAt(new Date())
                .seen(false)
                .build();
        MessageDTO savedMessageDTO = chatService.saveMessage(msg.getChatRoomId(), message);
        log.info("Broadcasting message to /room/messages/{}: {}", msg.getChatRoomId(), savedMessageDTO);
        messagingTemplate.convertAndSend("/room/messages/" + msg.getChatRoomId(), savedMessageDTO);
    }

    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable("roomId") Long roomId, Principal principal) {
        try {
            UserEntity user = getAuthenticatedUser(principal);
            log.info("Fetching messages for chat room {} by user {}", roomId, user.getId());
            ChatRoom chatRoom = chatService.getRooms(user.getId()).stream()
                    .filter(room -> room.getId().equals(roomId))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Chat room not found or user not a member: " + roomId));
            List<Message> messages = chatService.getMessagesFrom1(chatRoom);
            List<MessageDTO> messageDTOs = messages.stream().map(message -> {
                MessageDTO dto = new MessageDTO();
                dto.setId(message.getId());
                dto.setChatRoomId(message.getChatRoom().getId());
                dto.setChatRoomName(message.getChatRoom().getName());
                dto.setSenderId(message.getSender().getId());
                dto.setSenderUsername(message.getSender().getUsername());
                dto.setContent(message.getContent());
                dto.setAttachment(message.getAttachment() != null ? Base64.getEncoder().encodeToString(message.getAttachment()) : null);
                dto.setCreatedAt(dateFormatter.format(message.getCreatedAt()));
                dto.setSeen(message.isSeen());
                return dto;
            }).toList();
            log.info("Fetched {} messages for chat room {}", messageDTOs.size(), roomId);
            return ResponseEntity.ok(messageDTOs);
        } catch (Exception e) {
            log.error("Error fetching messages for chat room {}: {}", roomId, e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch messages: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping(value = "/rooms/create", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createChatRoom(@RequestBody ChatRoomCreationRequest request) {
        try {
            log.info("Received request to create ChatRoom: {}", request.getName());
            UserEntity authed = getAuthenticatedUser(null);
            ChatRoom chatRoom = new ChatRoom();
            chatRoom.setName(request.getName());
            ChatRoom createdChatRoom = chatService.createChatRoom(chatRoom, authed, request.getUserIds());
            log.info("ChatRoom created successfully with ID: {}", createdChatRoom.getId());
            return new ResponseEntity<>(createdChatRoom, HttpStatus.CREATED);
        } catch (Exception e) {
            log.error("Error creating ChatRoom: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create chat room: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping(value = "/rooms/join", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> joinChatRoom(@RequestBody ChatRoomDTO chatRoomDTO) {
        try {
            log.info("📥 Received join chat room request with payload: {}", chatRoomDTO);
            if (chatRoomDTO == null || chatRoomDTO.getId() == null) {
                log.error("Invalid chat room data for join: {}", chatRoomDTO);
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Chat room ID must not be null");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            String userId = getAuthenticatedUser(null).getId();
            log.info("User {} is joining chat room {}", userId, chatRoomDTO.getId());
            chatService.joinChatRoom(chatRoomDTO.getId(), userId);
            log.info("User {} successfully joined chat room {}", userId, chatRoomDTO.getId());
            ChatRoom chatRoom = chatService.getRooms(userId).stream()
                    .filter(room -> room.getId().equals(chatRoomDTO.getId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Chat room not found: " + chatRoomDTO.getId()));
            return ResponseEntity.ok(chatRoom);
        } catch (Exception e) {
            log.error("Error joining chat room {}: {}", chatRoomDTO != null ? chatRoomDTO.getId() : "null", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to join chat room: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping(value = "/rooms/leave", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> leaveChatRoom(@RequestBody ChatRoomDTO chatRoomDTO) {
        try {
            log.info("📥 Received leave chat room request with payload: {}", chatRoomDTO);
            if (chatRoomDTO == null || chatRoomDTO.getId() == null) {
                log.error("Invalid chat room data for leave: {}", chatRoomDTO);
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Chat room ID must not be null");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            String userId = getAuthenticatedUser(null).getId();
            log.info("User {} is leaving chat room {}", userId, chatRoomDTO.getId());
            chatService.leaveChatRoom(chatRoomDTO.getId(), userId);
            log.info("User {} successfully left chat room {}", userId, chatRoomDTO.getId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error leaving chat room {}: {}", chatRoomDTO != null ? chatRoomDTO.getId() : "null", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to leave chat room: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping(value = "/rooms", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> editChatRoom(@RequestBody ChatRoomDTO chatRoomDTO) {
        try {
            log.info("📥 Received edit chat room request with payload: {}", chatRoomDTO);
            if (chatRoomDTO == null || chatRoomDTO.getId() == null) {
                log.error("Invalid chat room data for edit: {}", chatRoomDTO);
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Chat room ID must not be null");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            ChatRoom chatRoom = new ChatRoom();
            chatRoom.setId(chatRoomDTO.getId());
            chatRoom.setName(chatRoomDTO.getName());
            if (chatRoomDTO.getUserIds() != null && !chatRoomDTO.getUserIds().isEmpty()) {
                List<UserEntity> users = chatRoomDTO.getUserIds().stream()
                        .map(userId -> userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found: " + userId)))
                        .toList();
                chatRoom.setUsers(new ArrayList<>(users));
            }
            ChatRoom updatedChatRoom = chatService.editChatRoom(chatRoom);
            log.info("ChatRoom updated successfully with ID: {}", updatedChatRoom.getId());
            return ResponseEntity.ok(updatedChatRoom);
        } catch (Exception e) {
            log.error("Error editing ChatRoom with ID: {}: {}", chatRoomDTO != null ? chatRoomDTO.getId() : "null", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to edit chat room: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<?> deleteChatRoom(@PathVariable Long id) {
        try {
            log.info("Received request to delete ChatRoom with ID: {}", id);
            chatService.deleteChatRoom(id);
            log.info("ChatRoom deleted successfully with ID: {}", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting ChatRoom with ID: {}: {}", id, e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete chat room: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            log.info("Fetching all users");
            List<UserEntity> users = chatService.getAllUsers();
            log.info("Fetched {} users", users.size());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error fetching all users: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch users: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/messages/mark-as-read/{messageId}")
    public ResponseEntity<?> markMessageAsRead(@PathVariable Long messageId) {
        try {
            log.info("Marking message {} as read", messageId);
            chatService.markAsRead(messageId);
            log.info("Message {} marked as read successfully", messageId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error marking message {} as read: {}", messageId, e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to mark message as read: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/messages/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id) {
        try {
            log.info("Deleting message with ID: {}", id);
            chatService.deleteMessage(id);
            log.info("Message deleted successfully with ID: {}", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting message with ID: {}: {}", id, e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete message: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}