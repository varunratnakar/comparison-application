# comparison-application

How to run frontent and middleware:

docker-compose up

To recreate images:

docker-compose up --force-recreate --build -d

then run docker-compose up to start project with changed code

# Layout/Functionality descriptions of each section:

/middleware:
 1. Dockerfile: Dockerfile first starts dockerizing api.py with parameters from requirements.txt. When the middleware is dockerized, it will keep listening requests from frontend. Once middleware receives request from frontend, it will send the request to clinicaltrials.gov. After middleware receives data from clinicaltrials.gov, middleware will parse, sort and filter data and then send to frontend.
 3. requirements.txt: list of python libraries to include in api.py
 4. api.py: REST API with sorting algorithm and filtering - this is where all backend logic is contained

/frontend:
 1. Dockerfile: start project on port 3000 with libraries specified in package.json
 2. /src: contains frontend source code, contains .css file that corresponds to the .js file. Index.js is the react front end

# Ideas for future work
1. Display preview of treatment and results for each trial in the table view of UI - the user should be able to see as much as possible of which treatments were used and the relevant outcomes without having to click on an individual trial. However, we do not want to sacrifice the readability/conciseness of the table view. More communication with Yolanda Gil would be needed to determine which relevant results to include.
2. Highlight matching criteria in the individual trial view - When the user selects a trial to bring up the detailed view, any part of the text which found a match with the sorting criteria should be highlighted to make it more apparent to the user. To avoid additional complexity in the frontend, the logic for this should be implemented in the backend where we are already parsing the trial to find matches. Perhaps including the indices of the matched words within each section in the backend's response would be the best way forward.

# Instructions/Ideas for how to highlight matching criteria:
 1) Middleware can parse it and put the indices of keywords in JSON and send back, and frontend can add CSS tag highlight the matching keyword based on the indices.
 2) Frontend can go through all text and add CSS tag to the keywords.
