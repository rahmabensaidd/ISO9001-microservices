package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import tn.esprit.examen.nomPrenomClasseExamen.dto.PostDTO;
import tn.esprit.examen.nomPrenomClasseExamen.dto.CommentDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Comment;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Post;
import tn.esprit.examen.nomPrenomClasseExamen.services.PostService;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<List<PostDTO>> getPostsByUserId(@RequestParam String userId) {
        List<Post> posts = postService.getPostsByUserId(userId);
        List<PostDTO> postDTOs = posts.stream()
                .map(post -> {
                    PostDTO dto = new PostDTO();
                    dto.setContent(post.getContent());
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(postDTOs);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PostDTO> createPost(@Valid @RequestBody PostDTO postDTO, @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaimAsString("sub");
        Post post = new Post();
        post.setContent(postDTO.getContent());
        Post createdPost = postService.createPost(post, userId);
        PostDTO responseDTO = new PostDTO();
        responseDTO.setContent(createdPost.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    @PutMapping(value = "/{postId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PostDTO> updatePost(@PathVariable Long postId, @Valid @RequestBody PostDTO postDTO, @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaimAsString("sub");
        Post post = new Post();
        post.setContent(postDTO.getContent());
        Post updatedPost = postService.updatePost(postId, post, userId);
        PostDTO responseDTO = new PostDTO();
        responseDTO.setContent(updatedPost.getContent());
        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId, @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaimAsString("sub");
        postService.deletePost(postId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{postId}/comments", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PostDTO> addComment(@PathVariable Long postId, @Valid @RequestBody CommentDTO commentDTO, @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaimAsString("sub");
        Comment comment = new Comment();
        comment.setText(commentDTO.getText());
        Post updatedPost = postService.addComment(postId, comment, userId);
        PostDTO responseDTO = new PostDTO();
        responseDTO.setContent(updatedPost.getContent());
        return ResponseEntity.ok(responseDTO);
    }

    @PutMapping(value = "/{postId}/comments/{commentId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PostDTO> updateComment(@PathVariable Long postId, @PathVariable Long commentId, @Valid @RequestBody CommentDTO commentDTO, @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaimAsString("sub");
        Comment comment = new Comment();
        comment.setText(commentDTO.getText());
        Post updatedPost = postService.updateComment(postId, commentId, comment, userId);
        PostDTO responseDTO = new PostDTO();
        responseDTO.setContent(updatedPost.getContent());
        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/{postId}/comments/{commentId}")
    public ResponseEntity<PostDTO> deleteComment(@PathVariable Long postId, @PathVariable Long commentId, @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaimAsString("sub");
        Post updatedPost = postService.deleteComment(postId, commentId, userId);
        PostDTO responseDTO = new PostDTO();
        responseDTO.setContent(updatedPost.getContent());
        return ResponseEntity.ok(responseDTO);
    }

    @PostMapping(value = "/{postId}/comments/{commentId}/replies", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PostDTO> addReply(@PathVariable Long postId, @PathVariable Long commentId, @Valid @RequestBody CommentDTO replyDTO, @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaimAsString("sub");
        Comment reply = new Comment();
        reply.setText(replyDTO.getText());
        Post updatedPost = postService.addReply(postId, commentId, reply, userId);
        PostDTO responseDTO = new PostDTO();
        responseDTO.setContent(updatedPost.getContent());
        return ResponseEntity.ok(responseDTO);
    }
}
