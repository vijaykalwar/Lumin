const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailService = require('../services/emailService');

// ════════════════════════════════════════════════════════════
// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
// ════════════════════════════════════════════════════════════
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // ========== VALIDATION ==========
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address'
      });
    }

    // ========== FIND USER ==========
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // Don't reveal if email exists (security best practice)
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    }

    // ========== GENERATE RESET TOKEN ==========
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token before storing (security best practice)
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // ========== SAVE TOKEN TO USER ==========
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // ========== SEND EMAIL ==========
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    
    try {
      await emailService.sendPasswordResetEmail(user, resetUrl);
      
      console.log(`[AUTH] Password reset email sent to: ${user.email}`);
      
      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      });

    } catch (emailError) {
      // If email fails, clear the token
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      console.error('[AUTH] Password reset email failed:', emailError);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again later.'
      });
    }

  } catch (error) {
    console.error('[AUTH] Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.'
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Reset password with token
// @route   POST /api/auth/reset-password/:token
// @access  Public
// ════════════════════════════════════════════════════════════
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // ========== VALIDATION ==========
    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide password and confirm password'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // ========== HASH TOKEN ==========
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // ========== FIND USER WITH VALID TOKEN ==========
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired'
      });
    }

    // ========== HASH NEW PASSWORD ==========
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ========== UPDATE USER ==========
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    console.log(`[AUTH] Password reset successful for: ${user.email}`);

    // ========== SEND CONFIRMATION EMAIL (OPTIONAL) ==========
    if (emailService && emailService.sendPasswordChangedEmail) {
      emailService.sendPasswordChangedEmail(user).catch(err => {
        console.error('[AUTH] Password changed email failed:', err.message);
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('[AUTH] Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.'
    });
  }
};
