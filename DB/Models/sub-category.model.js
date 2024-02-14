import mongoose, { Schema, model } from "mongoose"


//============================== Create the subcategory schema ==============================//

const subCategorySchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    Image: {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true, unique: true }
    },
    folderId: { type: String, required: true, unique: true },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // superAdmin
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // superAdmin
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true }
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    })

// brands virtual populate
subCategorySchema.virtual('Brands', {
    ref: 'Brand',
    localField: '_id',
    foreignField: 'subCategoryId',
    // justOne: true
})
export default mongoose.models.SubCategory || model('SubCategory', subCategorySchema)