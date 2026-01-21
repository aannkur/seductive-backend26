import { Request,Response,NextFunction } from "express";
import axios from "axios";

export const verifyRecaptcha = async(
    req:Request,
    res:Response,
    next:NextFunction
):Promise<void | Response> =>{
    try {
        const token = req.body.recaptchaToken;
        if(!token){
        return res.status(400).json({
            success:false,
            message:"Recaptcha token is Required"
        });
        }

        const secretKey = process.env.RECAPTCHA_SECRET_KEY

        if(!secretKey){
          return  res.status(500).json({
                success:false,
                message:"Recaptcha secret key is not configured"
            });
        }

        const response = await axios.post<{ success: boolean }>("https://www.google.com/recaptcha/api/siteverify",
            null,
            { params:{
                secret:secretKey,
                response:token,
            },
         }
    )

    const { success } = response.data;

    if(!success){
      return  res.status(403).json({
            success:false,
            message:"Recaptcha verification failed"
        })
    }

    next()
    } catch (error) {
       return res.status(500).json({
      success: false,
      message: "reCAPTCHA validation error",
    });
     
    }
}