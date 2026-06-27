package com.kydira_api.service.impl;

import com.kydira_api.model.User;
import com.kydira_api.repository.UserRepository;
import com.kydira_api.repository.DocumentRepository;
import com.kydira_api.repository.QuizRepository;
import com.kydira_api.repository.SummaryRepository;
import com.kydira_api.model.Document;
import com.kydira_api.dto.UserDTO;
import com.kydira_api.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder; 

@Service
public class UserServiceImpl implements IUserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private SummaryRepository summaryRepository;

    @Override
    public User registerUser(UserDTO userDTO) {
        User user = new User();
        user.setEmail(userDTO.getEmail());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());

        // ¡Excelente adaptación! Encriptamos y guardamos la entidad directamente
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
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

        // Solo actualiza la contraseña si viene un valor real
        if (userDTO.getPassword() != null && !userDTO.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }

        return userRepository.save(user);
    }).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
}



    @Override
    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Correo electrónico no encontrado"));

        // Se actualiza la validación para comparar la contraseña plana contra la encriptada en la BD
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        return user;
    }

    @Override
    public void deleteAccount(Long id, String password) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        List<Document> documents = documentRepository.findByUserId_UserId(id);
        for (Document doc : documents) {
            quizRepository.deleteAll(quizRepository.findByDocumentId_DocumentId(doc.getDocumentId()));
            summaryRepository.deleteAll(summaryRepository.findByDocumentId_DocumentId(doc.getDocumentId()));
        }
        documentRepository.deleteAll(documents);

        userRepository.delete(user);
    }
}