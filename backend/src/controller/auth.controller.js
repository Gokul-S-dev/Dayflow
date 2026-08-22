import * as authService from "../services/auth.service.js";

export const login = async (req, res, next) => {
  try {
    const { login, password } = req.body;
    const result = await authService.login(login, password);

    res.status(200).json({
      success: true,
      message: result.requiresPasswordChange
        ? "Login successful. Password change required."
        : "Login successful.",
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        requiresPasswordChange: result.requiresPasswordChange
      }
    });
  } catch (err) {
    next(err);
  }
};

export const signup = async (req, res, next) => {
  try {
    const { employeeId, email, password, role } = req.body;
    const result = await authService.signupEmployee(employeeId, email, password, role);

    res.status(200).json({
      success: true,
      message: "Account activated successfully.",
      data: result
    });
  } catch (err) {
    next(err);
  }
};

export const signupCompany = async (req, res, next) => {
  try {
    const { companyName, firstName, lastName, email, phone, password, role } = req.body;
    const tempFile = req.file;

    const result = await authService.signupCompany({
      companyName,
      tempFile,
      firstName,
      lastName,
      email,
      phone,
      password,
      role
    });

    res.status(201).json({
      success: true,
      message: "Company and HR account created successfully.",
      data: result
    });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      data: result
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required"
      });
    }

    const tokens = await authService.refreshTokens(refreshToken);

    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      data: tokens
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (err) {
    next(err);
  }
};
