let sentiments;
    let eventurl = window.location.href;
    const theEventID = eventurl.substr(eventurl.lastIndexOf("/")+1);

    let fetchData = async (theurl) => {
        let response = await fetch(theurl);
        if(response.ok){
            console.log(response);
            sentiments = response.data;
            return await response;
        }
    }
    
    var ctx1 = document.getElementById("myChart1").getContext("2d");
    var ctx2 = document.getElementById("myChart2").getContext("2d");

    //let sentURL = 'http://localhost:3000/feedback/sentiment/6046c6b9325f81002121f2fa';
    let sentURL = 'http://random-coursework.herokuapp.com//feedback/sentiment/' +  + theEventID;
    fetchData( sentURL
    ).then(data => {
        if(data != null){
            data.json().then(data => {
                sentiments = data
            
                const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length

                var avg = [];
                var avgSent
                var sentArray = [];
                let timeArray = [];
                for (var i = 0; i < sentiments.length; i++){
                    avg.push(sentiments[i].sentiment);
                    avgSent = arrAvg(avg);
                    sentArray.push({t: sentiments[i].time, y: avgSent});
                    timeArray.push(sentiments[i].time);   
                }

                

                let dataset = {
                    labels: timeArray,
                    datasets: [{
                        label: 'Average Sentiment',
                        data: sentArray,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                };

                let options = {
                    scales: {
                        xAxes: [{
                        type: "time",
                        distribution: 'series',
                        time: {
                            min: timeArray[0],
                            max: timeArray[timeArray.length-1],
                            displayFormats: {
                            day: 'MMM YY'
                            }
                        },
                        ticks: {
                            source: "labels"
                        },
                        gridLines: {
                            display: false
                        }
                        }]
                    }
                }

                console.log(timeArray);
                //console.log(avgSent);
                var myChart = new Chart(ctx1, {
                    type: 'line',
                    data: dataset,
                    options: options,
                });
            });
        }
    });
        

    let ratings;

    //let rateURL = 'http://localhost:3000/feedback/sentiment/6046c6b9325f81002121f2fa';
    let rateURL = 'http://random-coursework.herokuapp.com//feedback/rating/' + theEventID;
    fetchData(rateURL
    ).then(data => {
        if(data != null){
            data.json().then(data => {
                ratings = data.Rating;
                console.log(ratings);

                let ratingArray = [];
                ratings.forEach((element) => {
                    console.log(element.rating);
                    ratingArray.push(parseInt(element.rating));
                });

                let finalRatings = [];
                const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);

                for( i = 1 ; i<=10; i++){
                    console.log(i);
                    finalRatings.push(countOccurrences(ratingArray, i));
                }
                console.log(ratingArray);
                console.log(finalRatings);


                let dataset = {
                    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
                    datasets: [
                        {
                            label: "Ratings",
                            backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850",
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)'],
                            data: finalRatings
                        }
                    ]
                };

                let options = {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    },
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Ratings'
                    }
                };

                var barChart = new Chart(ctx2, {
                    type: 'horizontalBar',
                    data: dataset,
                    options: options
                });
            });
        }
    });