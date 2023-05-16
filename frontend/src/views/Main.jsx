import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import InfoBox from "../components/InfoBox/InfoBox";
import Title from "../components/Title/Title";
import Button from "../components/Button/Button";

import plus from "../assets/img/plus.svg";
import pause from "../assets/img/pause.svg";
import deleteIcon from "../assets/img/delete.svg";
import logo from "../assets/img/logo-with-text.svg";
import exit from "../assets/img/exit.svg";
import Modal from "../components/Modal/Modal";
import Box from "../components/Box/Box";
import QRCode from "react-qr-code";
import {API_LINK} from "../const";

const Main = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    status: 0,
    stake: 0,
    reputation: 0,
  });

  const [payData, setPayData] = useState({
    link: "",
  });

  let cors = {
    mode: 'cors',
    headers: {
      'Access-Control-Allow-Origin':'*'
    }
  }

  useEffect(() => {
    if (!localStorage.getItem("address")) {
      navigate("/auth");
    } else {
      fetchData();
    }

    const interv = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(interv);
  }, []);

  async function fetchData() {
    let req = await fetch(
      `https://tonapi.io/v1/account/getInfo?account=${localStorage.getItem(
        "address"
      )}`
    );
    const info = await req.json();

    let addrBase64 = await fetch(
      `${API_LINK}/api/formatAddress?address=${localStorage.getItem("address")}`
    );
    addrBase64 = await addrBase64.json()

    console.log(`${API_LINK}/api/getOperator?address=${addrBase64.address}`)
    req = await fetch(
      `${API_LINK}/api/getOperator?address=${addrBase64.address}`
    );
    const operator = await req.json();
      console.log(operator)
    if (operator.error) {
      return fetchData();
    }

    if (operator?.operator?.stake == 0 && operator?.operator?.status !== 2) {
      navigate("/stake");
    }

    setData({
      status: operator.operator.status,
      stake: operator.operator.stake / Math.pow(10, 9),
      reputation: operator.operator.reputation / 10,
      balance: (info.balance / Math.pow(10, 9)).toFixed(2),
      address: operator.operator.address,
    });
  }

  async function removeStakeButton() {
    let req = await fetch(
      `${API_LINK}/api/removeStake?address=${localStorage.getItem(
        "address"
      )}`
    );
    const res = await req.json();

    setPayData({
      link: `ton://transfer/${res.address}?bin=${res.boc}&amount=${
        0.1 * Math.pow(10, 9)
      }`,
    });
    if (window.ton) {
      window.ton.send("ton_sendTransaction", [
        {
          to: res.address,
          value: 0.1 * Math.pow(10, 9),
          data: res.boc,
          dataType: "boc",
        },
      ]);
    }
  }

  async function withdrawStakeButton() {
    let req = await fetch(
      `${API_LINK}/api/withdraw?address=${localStorage.getItem(
        "address"
      )}`
    );
    const res = await req.json();

    setPayData({
      link: `ton://transfer/${res.address}?bin=${res.boc}&amount=${
        0.1 * Math.pow(10, 9)
      }`,
    });
    if (window.ton) {
      window.ton.send("ton_sendTransaction", [
        {
          to: res.address,
          value: 0.1 * Math.pow(10, 9),
          data: res.boc,
          dataType: "boc",
        },
      ]);
    }
  }

  async function pauseButton() {
    let req = await fetch(
      `${API_LINK}/api/pause?address=${localStorage.getItem(
        "address"
      )}`
    );
    const res = await req.json();

    setPayData({
      link: `ton://transfer/${res.address}?bin=${res.boc}&amount=${
        0.1 * Math.pow(10, 9)
      }`,
    });
    if (window.ton) {
      window.ton.send("ton_sendTransaction", [
        {
          to: res.address,
          value: 0.1 * Math.pow(10, 9),
          data: res.boc,
          dataType: "boc",
        },
      ]);
    }
  }

  async function cancelPauseButton() {
    let req = await fetch(
      `${API_LINK}/api/cancelPause?address=${localStorage.getItem(
        "address"
      )}`
    );
    const res = await req.json();

    setPayData({
      link: `ton://transfer/${res.address}?bin=${res.boc}&amount=${
        0.1 * Math.pow(10, 9)
      }`,
    });
    if (window.ton) {
      window.ton.send("ton_sendTransaction", [
        {
          to: res.address,
          value: 0.1 * Math.pow(10, 9),
          data: res.boc,
          dataType: "boc",
        },
      ]);
    }
  }

  return (
    <div class="dashboard">
      <header>
        <img src={logo} />

        <div class="user">
          {data.address && (
            <div class="address">
              {data.address.slice(0, 5)}...
              {data.address.slice(-4)}
            </div>
          )}
          <img
            src={exit}
            onClick={() => {
              localStorage.removeItem("address");
              window.location.reload();
            }}
          />
        </div>
      </header>

      <div class="content">
        <div class="left">
          <InfoBox title={"Your stake:"} value={`${data.stake}`} />
          <InfoBox title={"Your balance:"} value={`${data.balance} TON`} />
          <InfoBox title={"Reputation:"} value={data.reputation} />
          <InfoBox
            title={"Status:"}
            value={
              data.status == 0
                ? "Active"
                : data.status == 1
                ? "Pause"
                : "Deleted"
            }
          />
        </div>

        <div class="right">
          <Title>Actions</Title>
          <div class="action-buttons">
            <Button
              size={"small"}
              color={"dark"}
              style={{ "margin-bottom": 0 }}
              icon={plus}
              onClick={() => {
                navigate("/addStake");
              }}
            >
              Add stake
            </Button>
            {data.status == 0 && (
              <Button
                size={"small"}
                color={"dark"}
                icon={deleteIcon}
                onClick={removeStakeButton}
                style={{ "margin-bottom": 0 }}
              >
                Remove stake
              </Button>
            )}
            {data.status == 2 && (
              <Button
                size={"small"}
                color={"dark"}
                icon={deleteIcon}
                onClick={withdrawStakeButton}
              >
                Withdraw stake
              </Button>
            )}
          </div>

          {data.status == 0 && (
            <Button
              size={"small"}
              color={"dark"}
              icon={pause}
              onClick={pauseButton}
            >
              Pause
            </Button>
          )}
          {data.status == 1 && (
            <Button
              size={"small"}
              color={"dark"}
              icon={pause}
              onClick={cancelPauseButton}
            >
              Cancel pause
            </Button>
          )}
          <Button
            size={"small"}
            color={"dark"}
            style={{ "margin-bottom": 0 }}
            onClick={() => {
              navigate("/explorer");
            }}
          >
            Open explorer
          </Button>
        </div>
      </div>

      <Modal opened={payData.link}>
        <Box center={true}>
          <Title style={{ "margin-bottom": "24px" }} type={2}>
            Scan the QR code with your phone camera
          </Title>

          <div class="QRBox">
            <QRCode value={payData.link} />
          </div>

          <Button
            size={"medium"}
            color={"dark"}
            onClick={() => {
              window.open(payData.link);
            }}
          >
            Open wallet
          </Button>
          <Button
            size={"medium"}
            color={"dark"}
            onClick={() => {
              fetchData();
              setPayData({
                link: "",
              });
            }}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default Main;
