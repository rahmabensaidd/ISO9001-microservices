package tn.esprit.examen.nomPrenomClasseExamen.services;

import org.springframework.stereotype.Service;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Data;
import tn.esprit.examen.nomPrenomClasseExamen.repositories.DataRepository;

import java.util.List;

@Service
public class DataService implements IDataService {

    private final DataRepository dataRepository;

    public DataService(DataRepository dataRepository) {
        this.dataRepository = dataRepository;
    }

    @Override
    public Data addData(Data data) {
        return dataRepository.save(data);
    }

    @Override
    public List<Data> getAllData() {
        return dataRepository.findAll();
    }

    @Override
    public Data getData(Long id) {
        return dataRepository.findById(id).orElse(null);
    }

    @Override
    public Data updateData(Long id, Data newData) {
        Data existingData = dataRepository.findById(id).orElse(null);
        if (existingData != null) {
            existingData.setDatatype(newData.getDatatype());
            existingData.setContent(newData.getContent());
            existingData.setRegistrationDate(newData.getRegistrationDate());
            return dataRepository.save(existingData);
        }
        return null;
    }

    @Override
    public void deleteData(Long id) {
        dataRepository.deleteById(id);
    }
}