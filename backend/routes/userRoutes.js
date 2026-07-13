import { Router } from 'express';
import{getUserDetailsFromHash} from '../src/controllers/userController.js';

const router = Router();

router.post("/user-details-from-hash", getUserDetailsFromHash);

export default router;
