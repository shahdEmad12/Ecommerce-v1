import User from '../../../DB/Models/user.model.js'
import bcrypt from 'bcrypt'

//............................. update user profile ...............................
export const updateUser = async(req,res,next) => {
    // 1- destructuring the request body
    const {username, email, password, age, role, phoneNumbers, addresses} = req.body

    // 3- destructuring _id from the request authUser
    const{_id} = req.authUser

    // 4- Retrieve the user from the database
    const user = await User.findById({_id})
    if (!user) return next(new Error('the user is not the profile owner', { cause: 404 }))

    // 5- check if the email is exist
    if(email){
    const emailIsDuplicated = await User.findOne({email})
    if (emailIsDuplicated) return next(new Error('email is duplicated', { cause: 404 }))
    user.email = email
    }
    // 6- update password if sent 
    if(password){
        //6.1 checks if the password is already exist
        const passwordCompare = bcrypt.compareSync(password, req.authUser.password)
        if(passwordCompare) return next(new Error('password already exists', { cause: 404 }))

        //6.2 hash the password
        const newPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS)
        //6.3 set value for password
        User.password = newPassword
    }


    // set values for fields
    user.username = username;
    user.age = age;
    user.role = role;
    user.phoneNumbers = phoneNumbers;
    user.addresses = addresses;

    await user.save()
    res.status(200).json({ success: true, message: 'user updated successfully', data: user })
}

//............................ delete user .............................
export const deleteUser = async(req,res,next) => {
    
    // 1- destructuring _id from the request authUser
    const {_id} = req.authUser

    // 2- delete user
    const userDelete = await User.findByIdAndDelete(_id)
    if(!userDelete) return next(new Error('deleting failed', {cause: 404}))

    return res.status(200).json({message:'deleting successfully'})
}

//......................... get user profile ................................
export const getUserProfile = async (req, res, next) => {
    //extract user ID from req.authUser
    const {_id} = req.authUser
    //find user by ID
    const userProfile = await User.findById(_id)
    //if user profile is found return user data
    res.status(200).json({ message: "User data:", userProfile })
}