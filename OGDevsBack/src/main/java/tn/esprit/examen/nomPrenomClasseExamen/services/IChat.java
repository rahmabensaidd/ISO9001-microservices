package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.dto.MessageDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.ChatRoom;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Message;
import tn.esprit.examen.nomPrenomClasseExamen.entities.UserEntity;

import java.util.List;

public interface IChat {
    MessageDTO saveMessage(Long channelId, Message message);
    void sendMessage(Long channelId, Message message);
    void sendPrivateMessage(String senderId, String receiverId, Message message);
    void markAsRead(Long messageId);
    void deleteMessage(Long id);
    List<Message> getLastMessage(List<ChatRoom> chatRooms);
    List<Message> getLastMessage1(List<ChatRoom> chatRooms);
    List<ChatRoom> getRooms(String userId);
    ChatRoom createChatRoom(ChatRoom chatRoom, UserEntity authed, List<String> userIdsToAdd); // Updated to accept user IDs
    void joinChatRoom(Long chatRoomId, String userId);
    void leaveChatRoom(Long chatRoomId, String userId);
    ChatRoom editChatRoom(ChatRoom chatRoom);
    void deleteChatRoom(Long id);
    List<Message> getMessagesFrom(ChatRoom chatRoom, Long messageId);
    List<Message> getMessagesFrom1(ChatRoom chatRoom);
    List<Message> getLast10MessageStartingFrom(ChatRoom chatRoom, Long messageId);
    List<UserEntity> getAllUsers(); // New method to fetch all users
}