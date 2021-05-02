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
 3. Index.js - The input form is always displayed. When a search is executed, the table view will show up which allows for comparison of all trials side-by-side. Clicking on any part of a trial will bring up the detailed view for that trial. The idea is that the user can use the table view to narrow down the selection of trials to find what is most relevant, and then easily see the more in-depth description of that trial to check if it is in fact helpful. The table view can then be brought up again in the case that the user wants to return to select another trial.

# Ideas for future work
1. Display preview of treatment and results for each trial in the table view of UI - the user should be able to see as much as possible of which treatments were used and the relevant outcomes without having to click on an individual trial. However, we do not want to sacrifice the readability/conciseness of the table view. More communication with Yolanda Gil would be needed to determine which relevant results to include.
2. Highlight matching criteria in the individual trial view - When the user selects a trial to bring up the detailed view, any part of the text which found a match with the sorting criteria should be highlighted to make it more apparent to the user. To avoid additional complexity in the frontend, the logic for this should be implemented in the backend where we are already parsing the trial to find matches. Perhaps including the indices of the matched words within each section in the backend's response would be the best way forward.
3. Results section of individual trial display - More work with Yolanda is needed to determine exactly what information to display in this section. We have some preliminary efforts in the code, however the information we initially were displaying was not correct and more in-depth understanding of exactly how the results of clinical trials are measured is needed to move forward in this section. Perhaps there will need to be different techniques used for different types of clinical trials, as there seems to be a large disparity in how results are quantified.
4. Due to differences in how clinical trials are structured, it doesn't always make sense to use the same JSON fields in the display/sorting. I think the best way to move forward is to implement additional functionality in the backend which reads and restructures each trial into our own data structure so that when it is sent to the frontend, we have predictable, consistent information for each trial.
