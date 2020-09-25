import React, {useEffect, useState} from 'react';
import './App.css';
import {
    MenuItem,
    FormControl,
    Select,
    Card,
    CardContent,
} from "@material-ui/core";
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import { prettyPrintStat, sortData } from "./util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";

function App() {
    const [countries, setCountries] = useState([]);
    const [country, setCountry] = useState('worldwide');
    const [countryInfo, setCountryInfo] = useState({});
    const [tableData, setTableData] = useState([]);
    const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796});
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
            await fetch('https://disease.sh/v3/covid-19/countries')
                .then((response) => response.json())
                .then((data) => {
                    const countries = data.map((country) => (
                        {
                            name: country.country,
                            value: country.countryInfo.iso2
                        }));
                    const sortedData = sortData(data);
                    setCountries(countries);
                    setMapCountries(data);
                    setTableData(sortedData);
                });
        };

        getCountriesData();

    }, []);

    const onCountryChange = async (e) => {
        const countryCode = e.target.value;

        const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' :
            `https://disease.sh/v3/covid-19/countries/${countryCode}`;

        await fetch(url)
            .then((response) => response.json())
            .then((data) => {
                setCountry(countryCode);
                setCountryInfo(data);
                const loc = () => {
                    if (data.countryInfo) {
                        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
                    } else {
                        setMapCenter({ lat: 34.80746, lng: -40.4796});
                    }
                }
                loc();
                setMapZoom(4);
            });
    }

    return (
    <div className="app">
        <div className="app_left">
            <div className="app_header">
                <h1>COVID-19 TRACKER</h1>
                <FormControl className="app_dropdown">
                    <Select
                        variant="outlined"
                        value={country}
                        onChange={onCountryChange}
                    >
                        <MenuItem value="worldwide">Worldwide</MenuItem>
                        {
                            countries.map((country) => (
                                <MenuItem key={country.value} value={country.value}>{country.name}</MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
            </div>

            <div className="app_stats">
                <InfoBox
                    isRed
                    active={casesType === "cases"}
                    onClick={() => setCasesType('cases')}
                    title="Coronavirus Cases"
                    cases={prettyPrintStat(countryInfo?.todayCases)}
                    total={prettyPrintStat(countryInfo?.cases)}
                />
                <InfoBox
                    active={casesType === "recovered"}
                    onClick={() => setCasesType('recovered')}
                    title="Recovered"
                    cases={prettyPrintStat(countryInfo?.todayRecovered)}
                    total={prettyPrintStat(countryInfo?.recovered)}
                />
                <InfoBox
                    isRed
                    active={casesType === "deaths"}
                    onClick={() => setCasesType('deaths')}
                    title="Deaths"
                    cases={prettyPrintStat(countryInfo?.todayDeaths)}
                    total={prettyPrintStat(countryInfo?.deaths)}
                />
            </div>
            <Map
                casesType={casesType}
                center={mapCenter}
                zoom={mapZoom}
                countries={mapCountries}
            />
        </div>
        <Card className="app_right">
            <CardContent>
                <h3>Live Cases by Country</h3>
                <Table countries={tableData} />
                <br /><br />
                <h3>Worldwide new {casesType}</h3>
                <br />
                <LineGraph casesType={casesType} />
            </CardContent>
        </Card>

    </div>
  );
}

export default App;
