import { productsModels } from "../dao/models/productsModels.js";

export class productsMongoManager {
    static async get(){
        return await productsModels.find().lean()
    }


    static async getBy (filtro = {}){
        return await productsModels.findOne(filtro).lean()
    }

    static async getById(id) {
        return await productsModels.findById(id).lean();
    }
    

    static async save(producto) {
        try {
            return await productsModels.create(producto);
        } catch (error) {
            console.error("Error al guardar producto:", error);
            throw error;
        }
    }
    

    static async update (id, aModificar){
        return await productsModels.findByIdAndUpdate (id, aModificar, {new: true}).lean()
    }

    static async delete (id){
        return await productsModels.findByIdAndDelete(id).lean()
    }

}