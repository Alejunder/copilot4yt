import mongoose from 'mongoose';


let connectionPromise: Promise<void> | null = null;

const connectDB = async (): Promise<void> => {

    if (mongoose.connection.readyState === 1) return;

 
    if (connectionPromise) return connectionPromise;

    connectionPromise = mongoose
        .connect(process.env.MONGO_URI as string)
        .then(() => {
            console.log('MongoDB connected successfully');
        })
        .catch((error) => {
            connectionPromise = null;
            console.error('Error connecting to MongoDB:', error);
            throw error;
        });

    return connectionPromise;
};

export default connectDB;