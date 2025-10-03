package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.entities.Data;
import java.util.List;

public interface IDataService {

    Data addData(Data data);
    List<Data> getAllData();
    Data getData(Long id);
    Data updateData(Long id, Data data);
    void deleteData(Long id);
}