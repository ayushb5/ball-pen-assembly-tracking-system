package com.ballpen.mes.service;

import com.ballpen.mes.dto.AuthResponse;
import com.ballpen.mes.dto.LoginRequest;
import com.ballpen.mes.dto.UserDto;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    UserDto getCurrentUser(String username);
}
