import mongoose from 'mongoose';

// Cache the connection promise so repeated calls (across serverless invocations
// that reuse the module) never open a second connection.
let connectionPromise: Promise<void> | null = null;

const connectDB = async (): Promise<void> => {
    // Already connected — nothing to do.
    if (mongoose.connection.readyState === 1) return;

    // Connection in progress — wait for the existing promise.
    if (connectionPromise) return connectionPromise;

    connectionPromise = mongoose
        .connect(process.env.MONGO_URI as string)
        .then(() => {
            console.log('MongoDB connected successfully');
        })
        .catch((error) => {
            // Allow a retry on the next request.
            connectionPromise = null;
            console.error('Error connecting to MongoDB:', error);
            throw error;
        });

    return connectionPromise;
};

export default connectDB;