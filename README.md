# SMU_FYP_Unofficial

## Project Description
FYP Project for SOSD

## Prerequisites
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
    - Has support for Windows and MacOS
- Clone this repo:
~~~
$ git clone https://github.com/gjegoh/SMU_FYP_Unofficial.git
$ cd FYP_Project
~~~

## Steps to Running the Project
- If running the project for the first time or made any changes to the docker-related files, build and start the container:
~~~
$ docker-compose up --build
~~~
- If container is already built:
~~~
$ docker-compose up
~~~
- If trying to wipe the local database/re-seed data:
~~~
$ docker-compose down --volumes
$ docker-compose up
~~~

## How to use the Project
- To login as a admin:
    - Username: admin
    - Password: admin


## Troubleshooting
- If docker-entrypoint.sh cannot be found when building and starting the container:
    - Navigate to ./backend and find the service that threw the error in the directory, open docker-entrypoint.sh in that folder (this has to be done using an IDE such as VSC)
    - At the bottom-right task bar, ensure end of line sequence is LF and save file with UTF-8 encoding
