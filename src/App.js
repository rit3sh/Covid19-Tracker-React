import "./App.css";
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import { useState, useEffect } from "react";
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import { prettyPrintStat, sortData } from "./util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries/")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2, // country code USA, UK etc
          }));

          const sortedData = sortData(data);

          setTableData(sortedData);
          setCountries(countries);

          setMapCountries(data);
        });
    };

    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;

    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    // console.log(url);

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode);
        setCountryInfo(data);
        // console.log(data.countryInfo.lat, data.countryInfo.long);

        countryCode === "worldwide"
          ? setMapCenter([34.80746, -40.4796])
          : setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });
    // console.log("cc", countryCode);
    // console.log("country info", countryInfo);
  };
  return (
    <div className='app'>
      <div className='app__top'>
        <div className='app__left'>
          <div className='app__header'>
            <h1>COVID-19 TRACKER</h1>
            <FormControl className='app__dropdown'>
              <Select
                variant='outlined'
                value={country}
                onChange={onCountryChange}
              >
                <MenuItem value='worldwide'>Worldwide</MenuItem>
                {/* {}look through all the countries and show a drop down list of options */}
                {countries.map((country) => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className='app__stats'>
            <InfoBox
              isRed
              active={casesType === "cases"}
              title='Coronavirus Cases'
              total={prettyPrintStat(countryInfo.cases)}
              cases={prettyPrintStat(countryInfo.todayCases)}
              onClick={(e) => setCasesType("cases")}
            ></InfoBox>
            <InfoBox
              active={casesType === "recovered"}
              title='Recovered'
              total={prettyPrintStat(countryInfo.recovered)}
              cases={prettyPrintStat(countryInfo.todayRecovered)}
              onClick={(e) => setCasesType("recovered")}
            ></InfoBox>
            <InfoBox
              isRed
              active={casesType === "deaths"}
              title='Deaths'
              total={prettyPrintStat(countryInfo.deaths)}
              cases={prettyPrintStat(countryInfo.todayDeaths)}
              onClick={(e) => setCasesType("deaths")}
            ></InfoBox>
          </div>

          <Map
            casesType={casesType}
            countries={mapCountries}
            center={mapCenter}
            zoom={mapZoom}
          ></Map>
        </div>
        <Card className='app__right'>
          <CardContent>
            <h3>Live Cases by Country</h3>
            <Table countries={tableData}></Table>
          </CardContent>
        </Card>
      </div>
      <div className='app__bottom'>
        <Card>
          <CardContent>
            <h3 className='app__graphTitle'>Worldwide new {casesType}</h3>
            <LineGraph className='app__graph' casesType={casesType}></LineGraph>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
