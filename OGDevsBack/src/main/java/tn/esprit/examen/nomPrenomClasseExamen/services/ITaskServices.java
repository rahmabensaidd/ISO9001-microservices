package tn.esprit.examen.nomPrenomClasseExamen.services;

import tn.esprit.examen.nomPrenomClasseExamen.dto.TaskDTO;
import tn.esprit.examen.nomPrenomClasseExamen.entities.Task;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

public interface ITaskServices {
    Task createTask(Task task);
    Task updateTask(Long id, Task task);
    Optional<Task> getTaskById(Long id);
    List<TaskDTO> getAllTasks();
    void deleteTask(Long id);
    Task datasToTask(Long taskId, Set<Long> dataIds);
    long getTotalTasks();
    double getAverageDataPerTask();
    double getAverageTaskDuration();
    double getCompletionRate();
    Map<String, Long> getTasksByOperation();
    double getDataDurationCorrelation();
}