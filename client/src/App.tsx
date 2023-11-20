import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { Layout, Row, Col, Button, Spin } from "antd";
import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { Network, Provider } from "aptos";

export const provider = new Provider(Network.TESTNET);

export const moduleAddress = "0xc552f796f675c9ebcfdd8f21a4ec01a21c43a6853790bbc6d1a0486fd0652766";

function App() {
  const {account, signAndSubmitTransaction } = useWallet();
  const [counter, setCounter] = useState<number>(0);
  const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
  const [reload, setReload] = useState<number>(0);
  console.log(provider);

  useEffect(() => {
    fetch();
  }, [account?.address]);

  const fetch = async () => {
    if (!account) return;
    console.log(account?.address);
    try {
      const counterResource = await provider.getAccountResource(
        account?.address,
        `${moduleAddress}::counter::ClickCounts`
      );
      let data = JSON.parse((counterResource?.data as any).count);
      setCounter(data);
      if(reload){
        window.location.reload();
      }
    }
    catch (e: any) {
      initialize();
    }
  }

  const initialize = async () => {
    if (!account) return [];
    setTransactionInProgress(true);
    const payload = {
      type: "entry_function_payload",
      function: `${moduleAddress}::counter::initialize`,
      type_arguments: [],
      arguments: [],
    };
    try {
      const response = await signAndSubmitTransaction(payload);
      console.log(response, "response");
      await provider.waitForTransaction(response.hash);
    } catch (error: any) {
      console.log(error.response);
    } finally {
      setTransactionInProgress(false);
    }
  };

  const incrementCounter = async () => {
    setTransactionInProgress(true);

    const payload = {
      type: "entry_function_payload",
      function: `${moduleAddress}::counter::increment`,
      type_arguments: [],
      arguments: [],
    };
    try {
      const response = await signAndSubmitTransaction(payload);
      // wait for transaction
      await provider.waitForTransaction(response.hash);
      window.location.reload();
    } catch (error: any) {
      console.log(error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  const timer = () => { setInterval(() => { setReload(1); fetch() }, 5000); }

  useEffect(() => {
    timer();
  }, []);

  return (
    <>
      <Layout>
        <Row align="middle" justify="space-evenly" style={{backgroundColor:"#1c2124"}}>
          <Col >
            <h1 style={{color: "white"}}>Aptos Winter Challenge</h1>
          </Col>
          <Col style={{ textAlign: "right" }}>
            <WalletSelector />
          </Col>
        </Row>
      </Layout>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
        <Spin spinning={transactionInProgress}>
          <Row style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
            <Col>
              <Button
                disabled={!account}
                block
                onClick={incrementCounter}
                type="primary"
                style={{ margin: "0 auto", borderRadius: "50%", height: "300px", width: "300px", backgroundImage: `url(/aptos.png)` , display: "flex", flexDirection: "column", paddingTop:"55px", justifyContent: "center", alignItems: "center",backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat', }}
              >
                <p style={{ fontSize: "20px", color: "black", paddingBottom: "50px", fontFamily:"Roboto Slab"}}>BEAT ME</p>
              </Button>
            </Col>
          </Row>
          <Row>
            <Col>
              <p style={{ fontSize: "80px", textAlign: "center", color: "white", fontFamily:"Roboto Slab" }}>Count: {counter}</p>
            </Col>
          </Row>
        </Spin >
      </div>

    </>
  );
}

export default App;