package tn.esprit.examen.nomPrenomClasseExamen.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class OpenAIService {

    private final ChatModel chatModel;

    @Autowired
    public OpenAIService(OpenAiChatModel chatModel) {
        this.chatModel = chatModel;
    }
    public String suggestTechnologies(String projectType, String description, String deadline, List<String> requirements) {
        // Join requirements into a single string with newlines
        String requirementsText = String.join("\n", requirements);

// Updated prompt to allow dynamic technology types and ensure uniformity across stacks
        String promptText = String.format(
                "I am working on a project of type '%s' with the following description: '%s'. " +
                        "The deadline is '%s'. The project requirements are:\n%s.\n" +
                        "Suggest multiple technology stacks compatible with my project. " +
                        "Each stack must be a JSON object where each key is a technology type that is directly relevant to the project type, description, and requirements. " +
                        "Technology types are categories of technologies needed for the project, and they must be specific to the project’s domain. " +
                        "For a web project, relevant types might include categories like the user interface layer, server-side logic, data storage, communication protocol, or hosting infrastructure. " +
                        "For a machine learning project, relevant types might include categories like the machine learning framework, data preprocessing tools, computing environment, or deployment platform. " +
                        "For a cloud project, relevant types might include categories like the cloud provider, container management, service orchestration, monitoring tools, or serverless computing solutions. " +
                        "For a mobile project, relevant types might include categories like the mobile development framework, server-side logic, data storage, or communication protocol. " +
                        "Ensure that **all stacks contain the same technology types** (e.g., if one stack contains 'user interface' and 'data storage', then every stack should include those same types, even if the technologies within each type vary). " +
                        "Ensure that the technology types are appropriate for the project type and do not include categories that are irrelevant to the project’s domain (e.g., do not include user interface categories for a cloud infrastructure project unless explicitly relevant). " +
                        "Each value in the stack object must be the name of a specific technology that fits the corresponding type (e.g., a specific user interface framework, a specific cloud provider). " +
                        "The number of technology types in each stack should be appropriate for the project’s complexity, typically ranging from 3 to 6 types per stack. " +
                        "Return strictly a JSON object with a single key 'stacks' containing an array of stack objects. " +
                        "The response must contain only valid JSON, with no explanations, comments, or Markdown formatting.",
                projectType, description, deadline, requirementsText
        );


        // Create the prompt for the language model
        Prompt prompt = new Prompt(promptText);

        // Call the language model
        var chatResponse = chatModel.call(prompt);

        // Extract the response text
        String responseText = chatResponse.getResults().get(0).getOutput().getText();

        // Clean the response (remove any Markdown or extra formatting)
        String cleanedResponse = responseText.replaceAll("```json|```", "").trim();

        // Validate that the response is valid JSON
        try {
            new ObjectMapper().readTree(cleanedResponse);
            return cleanedResponse;
        } catch (IOException e) {
            throw new IllegalArgumentException("Invalid or malformed response from language model: " + responseText, e);
        }
    }
    public String suggestBugFixing(String bugDescription, String status, String priority) {
        // Construct the detailed prompt for AI-powered bug detection and fixing
        String promptText = String.format(
                "AI-Powered Bug Detection & Fixing\n" +
                        "This system analyzes code errors. It detects syntax, logic, and performance issues, classifies them, and suggests corrections with explanations. It provides automated debugging to help developers fix issues faster and improve code quality.\n\n" +
                        "🔹 Inputs:\n" +
                        "Bug Description (Error messages, logs, or debugging reports, which may include code snippets):\n" +
                        "'%s'\n\n" +
                        "🔹 Process:\n" +
                        "The AI analyzes the bug type (Syntax, Logic, Performance, Compatibility). It suggests fixes with explanations, and optionally validates fixes via automated testing.\n\n" +
                        "🔹 Outputs (in JSON format):\n" +
                        "Please return a valid JSON object with the following three keys:\n" +
                        "1. 'rootCauseAnalysis': A string explaining why the bug occurred, based on the description or code provided.\n" +
                        "2. 'codeCorrectionSuggestion': A string with a fixed code snippet or code modification suggestion, based on the bug description or code provided.\n" +
                        "3. 'performanceImprovementTips': A string with tips for improving the performance (if applicable), based on the analysis of the bug description.\n\n" +
                        "🔹 Status: '%s', Priority: '%s'.\n" +
                        "Please ensure the response is strictly in JSON format as described above, with the following structure:\n" +
                        "{\n" +
                        "  \"rootCauseAnalysis\": \"<Explanation of why the bug occurred>\",\n" +
                        "  \"codeCorrectionSuggestion\": \"<Fixed code or modification suggestion>\",\n" +
                        "  \"performanceImprovementTips\": \"<Tips for improving performance (if applicable)>\"\n" +
                        "}\n" +
                        "Please ensure that the response includes all three keys and is formatted correctly.",
                bugDescription, status, priority
        );


        // Créer le prompt pour OpenAI
        Prompt prompt = new Prompt(promptText);

        // Exécuter la requête OpenAI et récupérer la réponse
        var chatResponse = chatModel.call(prompt);

        // Extraire la réponse sous forme de texte
        String responseText = chatResponse.getResults().get(0).getOutput().getText();

        // Nettoyer la réponse pour enlever les balises Markdown
        String cleanedResponse = responseText.replaceAll("```json|```", "").trim();

        // Vérifier si la réponse nettoyée est un JSON valide
        try {
            new ObjectMapper().readTree(cleanedResponse);  // Utilise Jackson pour valider le JSON
            return cleanedResponse;
        } catch (IOException e) {
            throw new IllegalArgumentException("Réponse OpenAI invalide ou mal formatée : " + responseText);
        }
    }




    public String suggestPhases(String projectType, String description, List<String> requirements, List<String> processes) {
        // Join requirements and processes into single strings with newlines
        String requirementsText = String.join("\n", requirements);
        String processesText = String.join("\n", processes);

        // Craft the prompt for the language model
        String promptText = String.format(
                "I am working on a project of type '%s' with the following description: '%s'. " +
                        "The project requirements are:\n%s\n" +
                        "The project involves the following processes:\n%s\n" +
                        "Suggest a sequence of project phases that are logical, sequential, and tailored to the project type, description, requirements, and processes. " +
                        "Each phase must be a JSON object with two keys: 'name' (the name of the phase, e.g., 'Planning', 'Development') and 'description' (a brief description of what the phase entails, specific to the project). " +
                        "The phases should cover the entire project lifecycle, from initiation to completion, and be appropriate for the project’s domain (e.g., for a web project, include phases like 'UI Design', 'Backend Development'; for a machine learning project, include phases like 'Data Collection', 'Model Training'). " +
                        "Ensure that the number of phases is reasonable for the project’s complexity, typically ranging from 4 to 8 phases. " +
                        "Incorporate the provided processes into the phase descriptions where relevant (e.g., if 'Agile Development' is a process, mention sprints or iterative development in relevant phases). " +
                        "Return strictly a JSON object with a single key 'phases' containing an array of phase objects. " +
                        "The response must contain only valid JSON, with no explanations, comments, or Markdown formatting.",
                projectType, description, requirementsText, processesText
        );

        // Create the prompt for the language model
        Prompt prompt = new Prompt(promptText);

        // Call the language model
        var chatResponse = chatModel.call(prompt);

        // Extract the response text
        String responseText = chatResponse.getResults().get(0).getOutput().getText();

        // Clean the response (remove any Markdown or extra formatting)
        String cleanedResponse = responseText.replaceAll("```json|```", "").trim();

        // Validate that the response is valid JSON
        try {
            new ObjectMapper().readTree(cleanedResponse);
            return cleanedResponse;
        } catch (IOException e) {
            throw new IllegalArgumentException("Invalid or malformed response from language model: " + responseText, e);
        }
    }


}
