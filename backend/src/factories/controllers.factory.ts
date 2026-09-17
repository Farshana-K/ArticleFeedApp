import { UserRepository } from "../repositories/user.repository";
import { CategoryRepository } from "../repositories/category.repository";
import { ArticleRepository } from "../repositories/article.repository";
import { ArticleInteractionRepository } from "../repositories/article-interaction.repository";
import { PasswordService } from "../services/password.service";
import { TokenService } from "../services/token.service";
import { ImageStorageService } from "../services/image-storage.service";
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/user.service";
import { CategoryService } from "../services/category.service";
import { ArticleService } from "../services/article.service";
import { ArticleInteractionService } from "../services/article-interaction.service";
import { PasswordResetService } from '../services/password-reset.service';
import { OtpRepository } from '../repositories/otp.repository';
import { OtpService } from '../services/otp.service';
import { EmailService } from '../services/email.service';
import { EmailVerificationService } from '../services/email-verification.service';
import { AuthController } from "../controllers/auth.controller";
import { UserController } from "../controllers/user.controller";
import { CategoryController } from "../controllers/category.controller";
import { ArticleController } from "../controllers/article.controller";
import { ArticleInteractionController } from "../controllers/article-interaction.controller";
import { UploadController } from "../controllers/upload.controller";

const userRepository = new UserRepository();
const categoryRepository = new CategoryRepository();
const articleRepository = new ArticleRepository();
const interactionRepository = new ArticleInteractionRepository();
const passwordService = new PasswordService();
const tokenService = new TokenService();
const imageStorageService = new ImageStorageService();
const otpRepository = new OtpRepository();
const otpService = new OtpService(otpRepository);
const emailService = new EmailService();
const emailVerificationService = new EmailVerificationService(
  otpService,
  emailService,
  userRepository,
);

const passwordResetService = new PasswordResetService(
  otpService,
  emailService,
  userRepository,
  tokenService,
  passwordService
);

export const authController = new AuthController(
  new AuthService(
    userRepository,
    categoryRepository,
    passwordService,
    tokenService,
    emailVerificationService,
  ),
  tokenService,
  emailVerificationService,
  passwordResetService,
); 
export const userController = new UserController(
  new UserService(userRepository, categoryRepository, passwordService),
);
export const categoryController = new CategoryController(
  new CategoryService(categoryRepository),
);
export const articleController = new ArticleController(
  new ArticleService(
    articleRepository,
    categoryRepository,
    interactionRepository,
  ),
  userRepository,
);
export const articleInteractionController = new ArticleInteractionController(
  new ArticleInteractionService(articleRepository, interactionRepository),
);
export const uploadController = new UploadController(imageStorageService);
