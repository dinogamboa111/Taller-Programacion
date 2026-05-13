package com.kydira_api.service.impl;

import com.kydira_api.model.User;
import com.kydira_api.repository.UserRepository;
import com.kydira_api.dto.UserDTO;
import com.kydira_api.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserServiceImpl implements IUserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public User registerUser(UserDTO userDTO) {
        User user = new User();
        user.setEmail(userDTO.getEmail());
        user.setName(userDTO.getName());
        user.setRole(userDTO.getRole());
        user.setPassword(userDTO.getPassword()); // En Sprint 3 agregamos cifrado
        return userRepository.save(user);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User updateProfile(Long id, UserDTO userDTO) {
        return userRepository.findById(id).map(user -> {
            user.setName(userDTO.getName());
            user.setEmail(userDTO.getEmail());
            // Solo actualiza contraseña si viene en el DTO
            if (userDTO.getPassword() != null) user.setPassword(userDTO.getPassword());
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}