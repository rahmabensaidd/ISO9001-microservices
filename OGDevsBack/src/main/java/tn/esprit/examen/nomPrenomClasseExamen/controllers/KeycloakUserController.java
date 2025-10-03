package tn.esprit.examen.nomPrenomClasseExamen.controllers;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.keycloak.representations.idm.RoleRepresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Role;
import tn.esprit.examen.nomPrenomClasseExamen.entities.UserEntity;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.UserEntityRepository;
import tn.esprit.examen.nomPrenomClasseExamen.services.KeycloakUserService;

import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class KeycloakUserController {

    private static final Logger log = LoggerFactory.getLogger(KeycloakUserController.class);
    private final KeycloakUserService keycloakUserService;
    private final UserEntityRepository userEntityRepository;

    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<UserEntity> users = userEntityRepository.findAllWithRoles();
        List<Map<String, Object>> userList = users.stream()
                .filter(user -> {
                    boolean isValid = user.getId() != null && !user.getId().isEmpty() &&
                            user.getId().matches("^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$");
                    if (!isValid) {
                        log.warn("Skipping invalid user with ID: {}", user.getId());
                    }
                    return isValid;
                })
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("username", user.getUsername());
                    userMap.put("email", user.getEmail());
                    userMap.put("enabled", user.isEnabled());
                    List<String> roleNames = user.getRoles().stream()
                            .map(Role::getRoleName)
                            .collect(Collectors.toList());
                    userMap.put("roles", roleNames);
                    return userMap;
                })
                .toList();
        log.info("Returning {} valid users", userList.size());
        return ResponseEntity.ok(userList);
    }

    @PostMapping("/create")
    public ResponseEntity<String> createUser(@RequestBody Map<String, Object> request) {
        String username = (String) request.get("username");
        String email = (String) request.get("email");
        String password = (String) request.get("password");
        List<String> roles = null;
        if (request.containsKey("roles")) {
            try {
                @SuppressWarnings("unchecked")
                List<String> rawRoles = (List<String>) request.get("roles");
                roles = rawRoles;
            } catch (ClassCastException e) {
                return ResponseEntity.status(400).body("Invalid roles format: must be a list of strings");
            }
        }

        if (username == null || email == null || password == null) {
            return ResponseEntity.status(400).body("Missing required fields: username, email, or password");
        }

        String result;
        if (roles != null) {
            result = keycloakUserService.createUserWithRoles(username, email, password, roles);
        } else {
            result = keycloakUserService.createUser(username, email, password);
        }

        if (result.contains("successfully")) {
            return ResponseEntity.status(201).body(result);
        } else if (result.contains("already exists")) {
            return ResponseEntity.status(409).body(result);
        } else if (result.contains("does not exist")) {
            return ResponseEntity.status(400).body(result);
        } else {
            return ResponseEntity.status(500).body(result);
        }
    }

    @DeleteMapping("/delete/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable String userId) {
        String result = keycloakUserService.deleteUser(userId);
        if (result.contains("successfully")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.status(500).body(result);
    }

    @PutMapping("/update-email/{userId}")
    public ResponseEntity<String> updateUserEmail(@PathVariable String userId, @RequestBody Map<String, Object> request) {
        String newEmail = (String) request.get("newEmail");

        if (newEmail == null) {
            return ResponseEntity.status(400).body("Missing required field: newEmail");
        }

        String result = keycloakUserService.updateUserEmail(userId, newEmail);
        if (result.contains("successfully")) {
            return ResponseEntity.ok(result);
        } else if (result.contains("already exists")) {
            return ResponseEntity.status(409).body(result);
        } else if (result.contains("not found")) {
            return ResponseEntity.status(404).body(result);
        } else {
            return ResponseEntity.status(500).body(result);
        }
    }

    @PostMapping("/roles/create")
    public ResponseEntity<String> createRole(@RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        String description = (String) request.get("description");

        if (name == null || description == null) {
            return ResponseEntity.status(400).body("Missing required fields: name or description");
        }

        String result = keycloakUserService.createRole(name, description);
        if (result.contains("successfully")) {
            return ResponseEntity.status(201).body(result);
        } else if (result.contains("already exists")) {
            return ResponseEntity.status(409).body(result);
        } else {
            return ResponseEntity.status(500).body(result);
        }
    }

    @GetMapping("/roles/all")
    public ResponseEntity<List<RoleRepresentation>> getAllRoles() {
        return ResponseEntity.ok(keycloakUserService.getAllRoles());
    }

    @GetMapping("/{userId}/profile-photo")
    public ResponseEntity<byte[]> getProfilePhoto(@PathVariable String userId) {
        try {
            Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String authenticatedUserId = jwt.getSubject();

            Optional<UserEntity> userEntityOptional = userEntityRepository.findById(userId);
            if (!userEntityOptional.isPresent()) {
                log.info("User not found with ID: {}", userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found.".getBytes());
            }

            String photoPath = keycloakUserService.getProfilePhotoPath(userId);
            java.nio.file.Path path = java.nio.file.Paths.get(photoPath);
            byte[] photoBytes = java.nio.file.Files.readAllBytes(path);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(photoBytes);
        } catch (IOException e) {
            log.warn("Error retrieving profile photo for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(("No profile photo available: " + e.getMessage()).getBytes());
        } catch (Exception e) {
            log.error("Unexpected error retrieving profile photo for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Failed to retrieve profile photo: " + e.getMessage()).getBytes());
        }
    }

    @PostMapping(value = "/{userId}/profile-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadProfilePhoto(@PathVariable String userId, @RequestParam("file") MultipartFile file) {
        try {
            Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String authenticatedUserId = jwt.getSubject();

            if (!authenticatedUserId.equals(userId)) {
                log.warn("Unauthorized attempt by user {} to upload photo for user {}", authenticatedUserId, userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "You can only upload a photo for your own account."));
            }

            if (file.isEmpty()) {
                log.warn("Empty file uploaded for user {}", userId);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "File is empty."));
            }

            String contentType = file.getContentType();
            if (!"image/jpeg".equals(contentType) && !"image/png".equals(contentType)) {
                log.warn("Invalid file type {} for user {}", contentType, userId);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Only JPEG or PNG files are allowed."));
            }

            String result = keycloakUserService.uploadProfilePhoto(userId, file);
            if (result.contains("successfully")) {
                return ResponseEntity.ok(Map.of("message", result));
            } else {
                log.error("Failed to upload profile photo: {}", result);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", result));
            }
        } catch (Exception e) {
            log.error("Unexpected error uploading profile photo for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload profile photo: " + e.getMessage()));
        }
    }

    @DeleteMapping("/roles/delete/{roleId}")
    public ResponseEntity<String> deleteRole(@PathVariable String roleId) {
        String result = keycloakUserService.deleteRoleById(roleId);
        if (result.contains("successfully")) {
            return ResponseEntity.ok(result);
        } else if (result.contains("not found")) {
            return ResponseEntity.status(404).body(result);
        } else {
            return ResponseEntity.status(500).body(result);
        }
    }

    @PutMapping("/roles/update/{roleName}")
    public ResponseEntity<String> updateRole(@PathVariable String roleName, @RequestBody Map<String, Object> request) {
        String newDescription = (String) request.get("newDescription");

        if (newDescription == null) {
            return ResponseEntity.status(400).body("Missing required field: newDescription");
        }

        String result = keycloakUserService.updateRole(roleName, newDescription);
        if (result.contains("successfully")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.status(500).body(result);
    }

    @PostMapping("/{userId}/profile")
    public ResponseEntity<String> createUserProfile(@PathVariable String userId, @RequestBody Map<String, Object> request) {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String authenticatedUserId = jwt.getSubject();

        if (!authenticatedUserId.equals(userId)) {
            log.warn("Unauthorized attempt by user {} to create profile for user {}", authenticatedUserId, userId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only create a profile for your own account.");
        }

        String birthdate = (String) request.get("birthdate");
        String position = (String) request.get("position");
        String education = (String) request.get("education");
        String languages = (String) request.get("languages");
        String phoneNumber = (String) request.get("phoneNumber");

        if (birthdate == null || position == null || education == null || languages == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing required fields: birthdate, position, education, or languages");
        }

        String result = keycloakUserService.createUserProfile(userId, birthdate, position, education, languages, phoneNumber);
        if (result.contains("successfully")) {
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } else if (result.contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }

    @PutMapping("/{userId}/profile")
    public ResponseEntity<String> updateUserProfile(@PathVariable String userId, @RequestBody Map<String, Object> request) {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String authenticatedUserId = jwt.getSubject();

        if (!authenticatedUserId.equals(userId)) {
            log.warn("Unauthorized attempt by user {} to update profile for user {}", authenticatedUserId, userId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only update your own profile.");
        }

        String birthdate = (String) request.get("birthdate");
        String position = (String) request.get("position");
        String education = (String) request.get("education");
        String languages = (String) request.get("languages");
        String phoneNumber = (String) request.get("phoneNumber");

        String result = keycloakUserService.updateUserProfile(userId, birthdate, position, education, languages, phoneNumber);
        if (result.contains("successfully")) {
            return ResponseEntity.ok(result);
        } else if (result.contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
        } else if (result.contains("Invalid birthdate format")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }

    @GetMapping("/{userId}/profile")
    public ResponseEntity<Map<String, Object>> getUserProfile(@PathVariable String userId) {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String authenticatedUserId = jwt.getSubject();

        Optional<UserEntity> userEntityOptional = userEntityRepository.findById(userId);
        if (!userEntityOptional.isPresent()) {
            log.info("User not found with ID: {}", userId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found with ID: " + userId));
        }

        UserEntity user = userEntityOptional.get();
        Map<String, Object> profile = new HashMap<>();
        profile.put("username", user.getUsername());
        profile.put("birthdate", user.getBirthdate());
        profile.put("position", user.getPosition());
        profile.put("education", user.getEducation());
        profile.put("languages", user.getLanguages());
        if (authenticatedUserId.equals(userId)) {
            profile.put("phoneNumber", user.getPhoneNumber());
        }
        profile.put("email", user.getEmail());

        return ResponseEntity.ok(profile);
    }

    @PostMapping("/{userId}/follow/{followedId}")
    public ResponseEntity<String> followUser(@PathVariable String userId, @PathVariable String followedId) {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String authenticatedUserId = jwt.getSubject();

        if (!authenticatedUserId.equals(userId)) {
            log.warn("Unauthorized attempt by user {} to follow as user {}", authenticatedUserId, userId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only perform actions for your own account.");
        }

        try {
            String result = keycloakUserService.followUser(userId, followedId);
            if (result.equals("Successfully followed user") || result.equals("Already following this user")) {
                log.info("User {} successfully followed or already follows user {}", userId, followedId);
                return ResponseEntity.ok("User followed successfully");
            } else if (result.contains("not found")) {
                log.info("User not found: {}", result);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
            } else if (result.equals("Cannot follow yourself")) {
                log.info("Follow request rejected: {}", result);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
            } else {
                log.error("Unexpected result from followUser service: {}", result);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error while processing follow request");
            }
        } catch (Exception e) {
            log.error("Exception in followUser endpoint for user {} following {}: {}", userId, followedId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to follow user due to an internal error");
        }
    }

    @DeleteMapping("/{userId}/unfollow/{followedId}")
    public ResponseEntity<String> unfollowUser(@PathVariable String userId, @PathVariable String followedId) {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String authenticatedUserId = jwt.getSubject();

        if (!authenticatedUserId.equals(userId)) {
            log.warn("Unauthorized attempt by user {} to unfollow as user {}", authenticatedUserId, userId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only perform actions for your own account.");
        }

        try {
            String result = keycloakUserService.unfollowUser(userId, followedId);
            if (result.contains("successfully")) {
                return ResponseEntity.ok(result);
            } else if (result.contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
            } else if (result.contains("Not following")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
            }
        } catch (Exception e) {
            log.error("Error in unfollowUser endpoint for user {} unfollowing {}: {}", userId, followedId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to unfollow user: " + e.getMessage());
        }
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<List<Map<String, Object>>> getFollowers(@PathVariable String userId) {
        List<Map<String, Object>> followers = keycloakUserService.getFollowers(userId);
        return ResponseEntity.ok(followers);
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<List<Map<String, Object>>> getFollowing(@PathVariable String userId) {
        List<Map<String, Object>> following = keycloakUserService.getFollowing(userId);
        return ResponseEntity.ok(following);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchUsers(@RequestParam String query) {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String authenticatedUserId = jwt.getSubject();

        if (query == null || query.trim().isEmpty()) {
            log.warn("Search query is empty or null for user {}", authenticatedUserId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(List.of(Map.of("error", "Search query cannot be empty")));
        }

        List<Map<String, Object>> users = keycloakUserService.searchUsers(query);
        if (users.isEmpty()) {
            log.info("No users found for query: {} by user {}", query, authenticatedUserId);
            return ResponseEntity.ok(List.of());
        }

        return ResponseEntity.ok(users);
    }
}
