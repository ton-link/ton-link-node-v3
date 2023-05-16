import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import Title from "../components/Title/Title";
import Button from "../components/Button/Button";

import logo from "../assets/img/logo-with-text.svg";
import search from "../assets/img/search.svg";
import Badge from "../components/Badge/Badge";
import Text from "../components/Text/Text";
import Input from "../components/Input/Input";
import { API_LINK } from "../const";

const Explorer = () => {
  const [id, setId] = useState("");
  const [data, setData] = useState({});

  useEffect(() => {
    // window.ton.send(
    //     'ton_sendTransaction',
    //     [{
    //         to: 'EQAJJJNF0iLilBeRcWZoY9dXQa7_73YjBOtdEo-u0NzJf7-u',
    //         value: 1 * Math.pow(10, 9),
    //         data: 'te6cckEBAQEAOwAAcQ+KfqUAAAAAAAAAKGG0jrV+AAgA3AqlNWPRuft8GEXC+3ibyMmEvOyyRypoVVHICZUZ8rwQF9eEA2WZlG4=',
    //         dataType: 'boc'
    //     }]
    // );
  }, []);

  const getData = async () => {
    setData({});
    const req = await fetch(
      `${API_LINK}/api/getJobById?jobId=${id}`
    );
    const res = await req.json();

    if (res.error) {
      alert(res.error);
    } else {
      setData(res.result);
    }
  };
  return (
    <div class="dashboard">
      <header>
        <img src={logo} />
      </header>

      <div class="explorer">
        <Title>TON Link Explorer</Title>

        <div class="input">
          <Input
            type="number"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder={"Job id"}
            inputStyle={{ width: "50%", marginBottom: 0 }}
          />
          <Button
            icon={search}
            color={"white"}
            size={"small"}
            style={{ marginBottom: 0 }}
            onClick={getData}
          >
            Search
          </Button>
        </div>
      </div>

      {data.id && (
        <div class="explorer">
          <Title type={3} style={{ "margin-bottom": "24px" }}>
            Job #{data.id}
            <Badge>{data.jobStatus}</Badge>
          </Title>
          <Text>
            <span>Start:</span> {new Date(data.startedAt).toLocaleString()}
          </Text>
          <Text style={{ "margin-bottom": "24px" }}>
            <span>End:</span> {new Date(data.endedAt).toLocaleString()}
          </Text>

          <textarea readonly>{JSON.stringify(data, undefined, 8)}</textarea>
        </div>
      )}
    </div>
  );
};

export default Explorer;
