package tn.esprit.examen.nomPrenomClasseExamen.services;

import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.xml.sax.SAXException;

import java.io.IOException;
import java.io.InputStream;

@Service
public class TextExtractionService {

    private Tika tika;

    public TextExtractionService() {
    }

    private Tika getTika() {
        if (tika == null) {
            tika = new Tika();
        }
        return tika;
    }

    public String extractText(MultipartFile file) throws IOException, TikaException, SAXException {
        try (InputStream stream = file.getInputStream()) {
            return getTika().parseToString(stream);
        }
    }
}
