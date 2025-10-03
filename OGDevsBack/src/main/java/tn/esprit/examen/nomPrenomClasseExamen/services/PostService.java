package tn.esprit.examen.nomPrenomClasseExamen.services;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Comment;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Post;
import tn.esprit.examen.nomPrenomClasseExamen.entities.UserEntity;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.IPostRepository;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private static final Logger logger = LoggerFactory.getLogger(PostService.class);

    private final IPostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional
    public List<Post> getPostsByUserId(String userId) {
        logger.info("Fetching posts for userId: {}", userId);
        return postRepository.findByUserId(userId);
    }

    @Transactional
    public Post createPost(Post post, String userId) {
        if (post.getContent() == null || post.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Post content cannot be empty");
        }
        logger.info("Creating post for userId: {}, content: {}", userId, post.getContent());
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
        post.setUser(user);
        Post savedPost = postRepository.save(post);
        logger.info("Post created with ID: {}", savedPost.getId());
        return savedPost;
    }

    @Transactional
    public Post updatePost(Long postId, Post post, String userId) {
        logger.info("Updating post with ID: {} for userId: {}", postId, userId);
        Post existingPost = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found with ID: " + postId));
        if (!existingPost.getUser().getId().equals(userId)) {
            throw new SecurityException("User not authorized to update this post");
        }
        if (post.getContent() != null && !post.getContent().trim().isEmpty()) {
            existingPost.setContent(post.getContent());
        }
        Post updatedPost = postRepository.save(existingPost);
        logger.info("Post updated with ID: {}", updatedPost.getId());
        return updatedPost;
    }

    @Transactional
    public void deletePost(Long postId, String userId) {
        logger.info("Deleting post with ID: {} for userId: {}", postId, userId);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found with ID: " + postId));
        if (!post.getUser().getId().equals(userId)) {
            throw new SecurityException("User not authorized to delete this post");
        }
        postRepository.delete(post);
        logger.info("Post deleted with ID: {}", postId);
    }

    @Transactional
    public Post addComment(Long postId, Comment comment, String userId) {
        if (comment.getText() == null || comment.getText().trim().isEmpty()) {
            throw new IllegalArgumentException("Comment text cannot be empty");
        }
        logger.info("Adding comment to postId: {} for userId: {}, comment text: {}", postId, userId, comment.getText());
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found with ID: " + postId));
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
        comment.setUser(user);
        post.getComments().add(comment);
        Post updatedPost = postRepository.save(post);
        logger.info("Comment added to postId: {}, commentId: {}", postId, comment.getId());
        return updatedPost;
    }

    @Transactional
    public Post updateComment(Long postId, Long commentId, Comment comment, String userId) {
        logger.info("Updating comment with ID: {} on postId: {} for userId: {}", commentId, postId, userId);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found with ID: " + postId));
        Comment existingComment = post.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Comment not found with ID: " + commentId));
        if (!existingComment.getUser().getId().equals(userId)) {
            throw new SecurityException("User not authorized to update this comment");
        }
        if (comment.getText() != null && !comment.getText().trim().isEmpty()) {
            existingComment.setText(comment.getText());
        }
        Post updatedPost = postRepository.save(post);
        logger.info("Comment updated with ID: {} on postId: {}", commentId, postId);
        return updatedPost;
    }

    @Transactional
    public Post deleteComment(Long postId, Long commentId, String userId) {
        logger.info("Deleting comment with ID: {} on postId: {} for userId: {}", commentId, postId, userId);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found with ID: " + postId));
        Comment comment = post.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Comment not found with ID: " + commentId));
        if (!comment.getUser().getId().equals(userId)) {
            throw new SecurityException("User not authorized to delete this comment");
        }
        post.getComments().remove(comment);
        Post updatedPost = postRepository.save(post);
        logger.info("Comment deleted with ID: {} on postId: {}", commentId, postId);
        return updatedPost;
    }

    @Transactional
    public Post addReply(Long postId, Long commentId, Comment reply, String userId) {
        if (reply.getText() == null || reply.getText().trim().isEmpty()) {
            throw new IllegalArgumentException("Reply text cannot be empty");
        }
        logger.info("Adding reply to commentId: {} on postId: {} for userId: {}, reply text: {}", commentId, postId, userId, reply.getText());
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found with ID: " + postId));
        Comment parentComment = post.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Parent comment not found with ID: " + commentId));
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
        reply.setUser(user);
        parentComment.getReplies().add(reply);
        Post updatedPost = postRepository.save(post);
        logger.info("Reply added to commentId: {} on postId: {}, replyId: {}", commentId, postId, reply.getId());
        return updatedPost;
    }
}
