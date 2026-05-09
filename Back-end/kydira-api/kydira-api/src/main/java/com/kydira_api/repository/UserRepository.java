package com.kydira_api.repository;

import com.kydira_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Método útil para el login que haremos más adelante
    Optional<User> findByEmail(String email);
}