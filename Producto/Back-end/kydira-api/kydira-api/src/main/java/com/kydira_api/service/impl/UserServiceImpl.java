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
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());

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
            user.setFirstName(userDTO.getFirstName());
            user.setLastName(userDTO.getLastName());
            user.setEmail(userDTO.getEmail());
            user.setPassword(userDTO.getPassword());
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @Override
public User login(String email, String password) {
    // Buscamos al usuario por email
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Correo electrónico no encontrado"));

    // Validamos la contraseña (en el Sprint 3 podrías usar BCrypt)
    if (!user.getPassword().equals(password)) {
        throw new RuntimeException("Contraseña incorrecta");
    }

    return user;
}
}