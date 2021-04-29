# comparison-application

How to run frontent and middleware:

docker-compose up

To recreate images:

docker-compose up --force-recreate --build -d

then run docker-compose up to start project with changed code

# Layout/Functionality descriptions of each file:

/middleware:
 1. Dockerfile: specifies python version, installs dependencies in requirements.txt, runs api.py
 3. requirements.txt: list of python libraries to include in api.py
 4. api.py: REST API with sorting algorithm and filtering

/frontend:
 1. Dockerfile: start project on port 3000 with libraries specified in package.json
 2. /src: contains .css file that corresponds to the .js file. Index.js is the react front end
 
 - Dockerfile first starts dockerizing api.py with parameters from requirements.txt. When the middleware is dockerized, it will keep listening requests from frontend. Once middleware receives request from frontend, it will send the request to clinicaltrials.gov. After middleware receives data from clinicaltrials.gov, middleware will parse, sort and filter data and then send to frontend.

# Instructions/Ideas for how to highlight matching criteria:
 1) Middleware can parse it and put the indices of keywords in JSON and send back, and frontend can add CSS tag highlight the matching keyword based on the indices.
 2) Frontend can go through all text and add CSS tag to the keywords.
