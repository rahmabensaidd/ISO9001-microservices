//package com.alibou.book.security;
//
//import org.springframework.core.convert.converter.Converter;
//import org.springframework.lang.NonNull;
//import org.springframework.security.authentication.AbstractAuthenticationToken;
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.oauth2.jwt.Jwt;
//import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
//import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
//
//import java.util.*;
//import java.util.stream.Stream;
//
//import static java.util.stream.Collectors.toSet;
//
//public class KeycloakJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {
//
//    @Override
//    public AbstractAuthenticationToken convert(@NonNull Jwt source) {
//        return new JwtAuthenticationToken(
//                source,
//                Stream.concat(
//                        new JwtGrantedAuthoritiesConverter().convert(source).stream(),
//                        extractResourceRoles(source).stream()
//                ).collect(toSet())
//        );
//    }
//
//    private Collection<? extends GrantedAuthority> extractResourceRoles(Jwt jwt) {
//        Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
//
//        if (resourceAccess == null) {
//            return Collections.emptySet();
//        }
//
//        Map<String, Object> account = (Map<String, Object>) resourceAccess.get("account");
//
//        if (account == null) {
//            return Collections.emptySet();
//        }
//
//        List<String> roles = (List<String>) account.get("roles");
//
//        if (roles == null) {
//            return Collections.emptySet();
//        }
//
//        return roles.stream()
//                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.replace("-", "_")))
//                .collect(toSet());
//    }
//}
