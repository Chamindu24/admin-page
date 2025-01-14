import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a username"],
    },
    index: {
        type: String,
        required: [true, "Please provide an index number"],
        unique: false
    },
    imageURL: {
        type: String,
        required: [true, "Please provide an image url"],
        unique: true
    },
    seats: {
        type: String,
        required: [true, "Please provide seats"],
        unique: false
    },
    isApproves: {
        type: Boolean,
        required: [true, "Please provide seats"],
        default: false
      
    },
    users: [
        {
            username: {
                type: String,
                required: true
            },
            batch: {
                type: String,
                required: true
            },
            department: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            faculty: {
                type: String,
                required: true
            },
            foodList: {
                type: [String],  // Array of food items
                required: true
            },
            index: {
                type: String,
                required: true,
                unique: true
            },
            totalprice: {
                type: Number,
                required: true
            },
            whatsapp: {
                type: String,
                required: true
            }
        }
    ]
});

const Visitor = mongoose.models.Visitor || mongoose.model("Visitor", visitorSchema);

export default Visitor;