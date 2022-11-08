<div align="center">
<img src="https://user-images.githubusercontent.com/86096361/200165255-ee4bab05-24f4-42e3-bec2-6bcbfa33987d.png" width="300"/>
</div>
<div align="center">


<b><b>Ton-link</b></b> allows smart contracts to access data outside of the blockchain while maintaining data security.
</div>

## Info
This repository stores the oracle node code. An oracle node is required to transfer data from the real world to the blockchain. To run a node, you need to register in the Ton-link system. Please note that the oracle node must always be in enabled mode. If you want to stop it, then you should put your account on pause.

## Running a Ton-link node
### Local run
  1. Install [NodeJS](https://nodejs.org/en/download/package-manager/)
  2. Download ton-link-node-v3 ``` git clone https://github.com/ton-link/ton-link-node-v3.git && cd ton-link-node-v3 ```
  3. Run  ``` cd client && npm install ```
  4. Install [Postgres (>= 11.x)](https://wiki.postgresql.org/wiki/Detailed_installation_guides).
     - ``` CREATE TABLE job (jobID INT NOT NULL, ownership_job INT NOT NULL, status_job INT NOT NULL, place INT NOT NULL, start_time INT NOT NULL, end_time INT NOT NULL); ```
     - ``` CREATE TABLE link (jobID INT NOT NULL, count INT NOT NULL, first_link VARCHAR(255) NOT NULL, second VARCHAR(255) NOT NULL, third VARCHAR(255) NOT NULL, fourth VARCHAR(255) NOT NULL); ```
  5. Create an .env file
     - Use template env.example and fill it with your data (after rename it to .env)
     - Move the .env file to the client folder
  6. Install http-server ``` npm install --global http-server ```
  7. Create an var.env file
     - In the dashboard folder, change the var.env file by filling it with your data
  9. Start ton-link-node-v3 ``` node client/client ```

### Docker Compose
  1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
  1. Download ton-link-node-v3 ``` git clone https://github.com/ton-link/ton-link-node-v3.git && cd ton-link-node-v3 ```
  2. Create an .env file
     - Use template env.example and fill it with your data (after rename it to .env)
     - Move the .env file to the client folder
  3. Create an var.env file
     - In the dashboard folder, change the var.env file by filling it with your data
  4. Build ton-link-node-v3: ``` docker-compose build ```
  5. Run ton-link-node-v3: ``` docker-compose up ```
