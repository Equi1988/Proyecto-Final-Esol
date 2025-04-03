import mongoose from 'mongoose';


export const conectarDB = async(uriMongoDB, dbName) =>{
    try{

        await mongoose.connect(
            uriMongoDB,
            {
                dbName: dbName,
            }
        )

        console.log(`DB Online`)


    } catch (error) {
        console.error("Error al conectar a MongoDB:", error);
        process.exit(1);  // Finaliza la app si no puede conectarse
    }


};