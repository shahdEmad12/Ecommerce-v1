import Category from '../../../DB/Models/category.model.js'
import cloudinaryConnection from '../../utils/cloudinary.js'
import generateUniqueString from '../../utils/generate-Unique-String.js'
import Brand from '../../../DB/Models/brand.model.js'
import subCategory from '../../../DB/Models/sub-category.model.js'

import slugify from 'slugify'

//.......................... add category ...............................
export const addCategory = async (req,res,next)=> {
    // 1- destructuring the request body
    const { name } = req.body
    // 2- destructuring _id from the request authUser
    const { _id } = req.authUser

    // 3- check if the category name is already exist
    const isNameDuplicated = await Category.findOne({ name })
    if (isNameDuplicated) {
        return next( new Error('Category name is already exist' , {cause:409}) )
    }

    // 4- generate the slug
    const slug = slugify(name, '-')

    // 4- upload image to cloudinary
    if (!req.file) return next( new Error('image is required' , {cause:400}) )

    const folderId = generateUniqueString(4)
    const {secure_url, public_id} = await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${folderId}`
    })
    req.folder = `${process.env.MAIN_FOLDER}/Categories/${folderId}`

        // 5- generate the categroy object
        const category = {
            name,
            slug,
            Image: { secure_url, public_id },
            folderId,
            addedBy: _id
        }
        // 6- create the category
        const categoryCreated = await Category.create(category)
        req.savedDocument = { model: Category , _id: categoryCreated._id}
        res.status(201).json({ success: true, message: 'Category created successfully', data: categoryCreated })
    

}

//............................. update category ........................
export const updateCategory = async (req,res,next) => {
    // 1- destructuring the request body
    const {name, oldPublicId} = req.body
    // 2- destructing categoryid from params
    const {categoryId}= req.params
    // 3- destructuring _id from the request authUser
    const {_id} = req.authUser

    // 4- check if the category is exists
    const category = await Category.findById(categoryId)
    if (!category) return next({ cause: 404, message: 'Category not found' })

    // 5- update name
    if (name) {
        // 5.1 check if the new category name different from the old name
        if (name == category.name) {
            return next({ cause: 400, message: 'Please enter different category name from the existing one.' })
        }

        // 5.2 check if the new category name is already exist
        const isNameDuplicated = await Category.findOne({ name })
        if (isNameDuplicated) {
            return next({ cause: 409, message: 'Category name is already exist' })
        }

        // 5.3 set values for name and slug fields
        category.name = name
        category.slug = slugify(name, '_')
    }

    // 6 update images
    if(oldPublicId){

    if(!req.file) return next({ cause: 400, message: 'Image is required' })
    const newPublicId = oldPublicId.split(`${category.folderId}/`)[1]
    const {secure_url} = await cloudinaryConnection().uploader.upload(req.file.path, {
        folder:`${process.env.MAIN_FOLDER}/Categories/${category.folderId}`,
        public_id: newPublicId
    })

    category.Image.secure_url = secure_url
}
req.folder = `${process.env.MAIN_FOLDER}/Categories/${category.folderId}`

// 7- set value for addedby
    category.addedBy = _id

    await category.save()
    res.status(200).json({ success: true, message: 'Category updated successfully', data: category })
}

//............................. get all categories ........................

export const getAllCategories = async (req,res,next) => {
    // nested populate
    const categories = await Category.find().populate([{ path: 'subcategories', populate: ([{path: 'Brands'}]) }])
    res.status(200).json({ success: true, message: 'Categories fetched successfully', data: categories })
}

//............................ delete categories ................................
export const deleteCategories = async (req,res,next) => {
    // 1- destructuring categoryid from params
    const {categoryId} = req.params
    // 2- destructuring _id from the request authUser
    const {_id} = req.authUser

    // 1- delete category
    const catgory = await Category.findByIdAndDelete(categoryId)
    if (!catgory) return next({ cause: 404, message: 'Category not found' })

    // 2-delete the related subcategories
    const subCategories = await subCategory.deleteMany({ categoryId })
    if (subCategories.deletedCount <= 0) {
        console.log(subCategories.deletedCount);
        console.log('There is no related subcategories');
    }

    //3- delete the related brands
    const brands = await Brand.deleteMany({ categoryId })
    if (brands.deletedCount <= 0) {
        console.log(brands.deletedCount);
        console.log('There is no related brands');
    }


    // 4- delete the category folder from cloudinary
    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FOLDER}/Categories/${catgory.folderId}`)
    await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FOLDER}/Categories/${catgory.folderId}`)

    res.status(200).json({ success: true, message: 'Category deleted successfully' })
}