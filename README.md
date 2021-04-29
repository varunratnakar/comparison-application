# comparison-application

How to run frontent and middleware:

docker-compose up

To recreate images:

docker-compose up --force-recreate --build -d

then run docker-compose up to start project with changed code

# Create brief text descriptions describing layout/functionality of each file and how they fit together:

 * In middleware:
 1. Dockerfile: This file builds the Docker container and dockerizes middleware to host its functions.
 2. requirements.txt: This file contains all required parameters for dockerization.
 3. api.py: This file handles RESTful API and sorting function.

 - Dockerfile first starts dockerizing api.py with parameters from requirements.txt. When the api.py is dockerized, it will keep listening requests from frontend. Once api.py receives request from frontend, it will send the request to clinicaltrials.gov. After api.py receives data from clinicaltrials.gov, it will parse, sort and filter the data and then send to frontend.

# Include instructions/ideas for how to highlight matching criteria:
 1) Middleware can parse it and put the indices of keywords in JSON and send back, and frontend can add CSS tag highlight the matching keyword based on the indices.
 2) Frontend can go through all text and add CSS tag to the keywords.
