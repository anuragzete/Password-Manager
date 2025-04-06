package com.project.passwordManager;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.*;

@WebServlet("/sync")
public class SyncServlet extends HttpServlet {

    private MongoCollection<Document> userCollection;

    @Override
    public void init() throws ServletException {
        try {
            userCollection = MongoDBConnection.getDatabase().getCollection("userPasswords");
            System.out.println("SyncServlet initialized.");
        } catch (Exception e) {
            throw new ServletException("Failed to initialize MongoDB connection", e);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String userId = request.getParameter("user_id");

        if (userId == null || userId.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write(new JSONObject().put("error", "Missing user_id").toString());
            return;
        }

        try {
            Document userDoc = userCollection.find(Filters.eq("_id", new ObjectId(userId))).first();

            if (userDoc != null) {
                // Fetch the password array as List<Document>
                List<Document> passwordList = (List<Document>) userDoc.get("passwords");

                // Convert the List<Document> to JSONArray
                JSONArray passwords = new JSONArray();

                for (Document passwordDoc : passwordList) {
                    JSONObject jsonPassword = new JSONObject(passwordDoc.toJson());
                    passwords.put(jsonPassword);
                }

                // Create the final response JSON
                JSONObject jsonResponse = new JSONObject();
                jsonResponse.put("status", "success");
                jsonResponse.put("passwords", passwords);

                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write(jsonResponse.toString(4));  // Pretty print response

            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write(new JSONObject().put("error", "User not found").toString());
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write(new JSONObject().put("error", e.getMessage()).toString());
        }
    }


    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try (BufferedReader reader = request.getReader()) {
            StringBuilder jsonInput = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                jsonInput.append(line);
            }

            JSONObject jsonObject = new JSONObject(jsonInput.toString());
            String userId = jsonObject.optString("user_id", "");

            if (userId.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write(new JSONObject().put("error", "Missing user_id").toString());
                return;
            }

            JSONArray localPasswords = jsonObject.getJSONArray("passwords");

            Document userDoc = userCollection.find(Filters.eq("_id", new ObjectId(userId))).first();

            if (userDoc != null) {
                // Convert JSONArray directly to List<Document>
                List<Document> updatedPasswords = new ArrayList<>();
                for (int i = 0; i < localPasswords.length(); i++) {
                    JSONObject jsonPwd = localPasswords.getJSONObject(i);
                    Document doc = Document.parse(jsonPwd.toString());
                    updatedPasswords.add(doc);
                }

                // Overwrite the passwords in MongoDB
                userCollection.updateOne(
                        Filters.eq("_id", new ObjectId(userId)),
                        new Document("$set", new Document("passwords", updatedPasswords))
                );

                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write(new JSONObject().put("status", "Sync successful").toString());
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write(new JSONObject().put("error", "User not found").toString());
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write(new JSONObject().put("error", e.getMessage()).toString());
        }
    }


    private JSONArray mergePasswords(JSONArray local, JSONArray server) {
        Map<String, JSONObject> passwordMap = new HashMap<>();

        // Add server passwords to the map
        for (int i = 0; i < server.length(); i++) {
            JSONObject serverPwd = server.getJSONObject(i);

            // Use fallback key to avoid JSONException
            String key = serverPwd.optString("id", UUID.randomUUID().toString());
            passwordMap.put(key, serverPwd);
        }

        // Add local passwords, overwriting any duplicates
        for (int i = 0; i < local.length(); i++) {
            JSONObject localPwd = local.getJSONObject(i);

            // Use the same fallback key logic
            String key = localPwd.optString("id", UUID.randomUUID().toString());
            passwordMap.put(key, localPwd);
            // Local version will overwrite the server version
        }

        return new JSONArray(passwordMap.values());
    }

    @Override
    public void destroy() {
        System.out.println("SyncServlet destroyed.");
    }
}
