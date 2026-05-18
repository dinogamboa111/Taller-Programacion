package com.kydira_api.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class UserDTO {
    private int userId;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private LocalDateTime registrationDate;
}
