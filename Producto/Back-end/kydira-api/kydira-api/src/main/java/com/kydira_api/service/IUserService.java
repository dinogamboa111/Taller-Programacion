package com.kydira_api.service;

import com.kydira_api.model.User;
import com.kydira_api.dto.UserDTO;
import java.util.Optional;

public interface IUserService {

    User registerUser(UserDTO userDTO);

    Optional<User> findByEmail(String email);

    User updateProfile(Long id, UserDTO userDTO); // Para la US-14
}