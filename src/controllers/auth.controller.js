import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken"
import config from "../config/config.js";

export async function register(req, res){
    const { userName, email, password } = req.body;

    const isAlreadyRegistered = await userModel.findOne({
        $or:[
            { userName },
            { email }
        ]
    })

    if(isAlreadyRegistered){
        return res
        .status(409)
        .json({message: "Username or email is already registered"}
        );
    }

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    const user = await userModel.create({
        userName,
        email,
        password: hashedPassword
    });

    const token = jwt.sign({
        id: user._id,
    }, config.JWT_SECRET, {
        expiresIn: "1d"
    })

    res
    .status(201)
    .json({
        message: "User registered successfully",
        token
    });

}