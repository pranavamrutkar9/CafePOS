import { Request, Response } from 'express';
import { AuthService } from './auth.service';

// TODO: Handle authentication requests, delegate verification to auth.service, manage HTTP cookies/sessions. Controller contains no DB queries.

export class AuthController {
  private authService = new AuthService();

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  signup = async (req: Request, res: Response) => {
    try {
      const { name, email, password, role } = req.body;
      const result = await this.authService.signup({ name, email, password, role });
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
