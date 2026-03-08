import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        mongoose.connection.once('connected', () => {
            console.log('MongoDB connected successfully');
        });
        await mongoose.connect(process.env.MONGO_URI as string);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

export default connectDB;