function writerBar(dataset){
//-----------for writter bar chart part---------------

      var margin_side = 50
      var count_range = d3.extent(dataset, function(d){return d.Count})



      //remove the movie without writer data
      var writer_dataset = dataset.filter(function(x){
          return x.Writer != ''
      })
 
      var total_movie = 0;

      //classify data by genres
      var genres_dataset = d3.group(writer_dataset, function(e){return e.genres})


      //combine all the genres into one array
      var allGenres = []
      for(let i of genres_dataset.keys()){
        let test = i.split(',')
        allGenres = allGenres.concat(test)
      }
      //remove the repeating genre
      var filterGenre = allGenres.filter(function(elem, pos) {
        return allGenres.indexOf(elem) == pos;
      });
      //console.log(filterGenre)
     



      //classify data by writer
      var writer_dataset2 = d3.group(writer_dataset, function(e){return e.Writer})

      

      //create canvans
      var canvas2_w = document.getElementById('writer_bar').clientWidth
      var bar_h = 25
      var bar_margin = 20 //for top & bottom
      var bar_space = 15
      

      var barPreview_w = 150
      var barPreview_margin = 2
      var preview_bar_height = 3
      var max_bar_w_pre = (barPreview_w-barPreview_margin)*0.85
      var barPreview_h = (preview_bar_height+barPreview_margin)*writer_dataset2.size+2*barPreview_margin

      //for preview scalling
      var bar_scale_preview = d3.scaleLinear()
                                  .domain(count_range)
                                  .range([15, max_bar_w_pre])


      //most movies number for a writer = 3
      //new scale for the bar length <- word count
      //word count 
      var max_bar_w = (canvas2_w-margin_side)*0.75
      var bar_scale = d3.scaleLinear()
                        .domain(count_range)
                        .range([150, max_bar_w])


      //for bar chart
      var canvas2_h = (bar_h+bar_space)*writer_dataset2.size+2*bar_margin
      var canvas2 = d3.select('#bar_chart')
                      .append('svg')
                      .attr('width',canvas2_w)
                      .attr('height',canvas2_h)
      

      //----- create preview bar chart-------------
      var barPreview = d3.select('#bar_chart')
                          .append('svg')
                          .attr('id','bar_preview')
                          .attr('width',barPreview_w)
                          .attr('height',barPreview_h+preview_bar_height)
                          .attr('opacity',0.7)
                          


      var writer_brush = d3.brushY()
                            .on('start brush end', handleBrush2)
      var pre_handel_h = (barPreview_h+preview_bar_height)*window.innerHeight/canvas2_h

      console.log(pre_handel_h)

      var brushExtent2 = [0,pre_handel_h]

      function initBarBrush() {
        d3.select('#bar_preview')
          .call(writer_brush)
          .call(writer_brush.move, brushExtent2)
          .selectAll('.handle').remove()
      }

      // ---- scroll position ---------------
      var scrollBar2 = document.getElementById('bar_chart')

      var bar_scroll_scale = d3.scaleLinear()
                            .domain([0, barPreview_h])
                            .range([0, canvas2_h])
        
      var bar_scroll_scale2 = d3.scaleLinear()
                            .domain([0, canvas2_h])
                            .range([0, barPreview_h])

      

      function handleBrush2(e) {
        console.log(e)
        scrollBar2.scrollTop = bar_scroll_scale(e.selection[0])
      }

      scrollBar2.addEventListener('scroll',function(e){
        console.log(e)
        let new_pos = bar_scroll_scale2(e.target.scrollTop)
        d3.select('#bar_preview')
          .call(writer_brush.move, [new_pos, new_pos+pre_handel_h])
      })


      //-------- preview bar update ------------
      function previewBarUpdate(data){

        //console.log(data)

        let pre_x_p = 0
        //console.log(data)

        barPreview.selectAll('.previewBar_group')
                  .data(data, function(e,d){
                  //console.log(e)
                  return e[0]
                  })   
                  .join(
                    function(enter){
                      var pre_bar = enter.append('g')
                                        .classed('previewBar_group',true)
                                        .attr('transform', function(d,i){
                                          let y = (i+1)*(preview_bar_height+barPreview_margin)+barPreview_margin
                                          return 'translate(5,' + y +')'
                                        })
                                          
                      
                      pre_bar.selectAll('.pre_movie_bar')
                              .data(function(d){return d[1]})
                              .join('rect')
                              .classed('pre_movie_bar',true)
                              .attr('width',function(d,i,j){return bar_scale_preview(d.Count)})
                              .attr('height',preview_bar_height)
                              .attr('x', function(d,i,j){
                                if(i>0){
                                  pre_x_p += j[i-1].width.baseVal.value + barPreview_margin
                                }
                                else{pre_x_p = 0}
                                return pre_x_p
                              })
                              .attr('y',-((preview_bar_height+barPreview_margin)/2))
                              .attr('fill','gray')
                              .attr('opacity',function(d){
                                //console.log(d.originalTitle)
                                if(new_movie_name.includes(d.originalTitle)){
                                  return 1
                                }
                                else{return 0.2}
                              })

                      return pre_bar.attr('opacity',1)
                    },
                    function(update){
                      let update_pre_bar = update
                      //bind each writer's data to draw bar
                      update_pre_bar.selectAll('.pre_movie_bar')
                                    .attr('width',function(d,i,j){
                                      return bar_scale_preview(d.Count)
                                    })
                                    .attr('height',preview_bar_height)
                                    .attr('x', function(d,i,j){
                                      if(i>0){
                                        pre_x_pos += j[i-1].width.baseVal.value + barPreview_margin
                                      }
                                      else{pre_x_pos = 0}
                                      return pre_x_pos
                                    })
                                    .attr('y',-((preview_bar_height+barPreview_margin)/2))
                                    .attr('fill','gray')
                                    .attr('opacity',function(d){
                                      if(new_movie_name.includes(d.originalTitle)){
                                        return 1
                                      }
                                      else{return 0.2}
                                    })
          
                      return update_pre_bar.attr('opacity',1)

                    },
                    function(exit){
                      return exit.attr('opacity',0.2)
                    }
                  )
      }


      //----- drawing bar for each movie ---------------


      var new_movie_name = []
      var new_writer_data

      function drawBar(newdata){
        //classify data by writer
        total_movie = newdata.length
        new_movie_name = []
        for(i of newdata){
          //console.log(test)
          new_movie_name.push(i.originalTitle)
        }
        d3.select('#movie_num')
          .html(total_movie)
        new_writer_data = d3.group(newdata, function(e){return e.Writer})
        //console.log(new_writer_data)
        canvas2.selectAll('.writer')
                .data(new_writer_data, function(e,d){
                  //console.log(e[1][0].originalTitle)
                  return e[0]
                })
                .join(
                  function(enter){
                    let writers = enter.append('g')
                                      .classed('writer',true)
                                      .attr('transform', function(d,i){
                                        let y = (i+1)*(bar_h+bar_space)+bar_margin
                                        return 'translate(0,' + y +')'
                                      })
                    //writer's name
                    writers.append('text')
                            .classed('writer_name',true)
                            .text(function(d){return d[0]})
                            .attr('x',12*bar_margin)
                            .attr('text-anchor','end')
                            .attr('dominant-baseline','middles')
                            .attr('fill','white')
                            .attr('font-weight',600)
                    
                    
                    //total count for a writer
                    writers.append('text')
                            .classed('total',true)
                            .text(function(d){
                              let total = 0
                              for(i of d[1]){
                                if(new_movie_name.includes(i.originalTitle)){
                                  total += i.Count
                                }
                              }
                              return total
                            })
                            .attr('x',13*bar_margin)
                            .attr('text-anchor','starts')
                            .attr('dominant-baseline','middles')
                            .attr('fill','white')
                            .attr('font-size', '18px')
                            .attr('font-weight',600)
            
                  //bar group
                  //bind each writer's data to draw bar
                    let pre_x_pos = 0

                    writers.append('g')
                            .classed('rect_movie',true)
                            .selectAll('.movie_bar')
                            .data(function(d){
                              //console.log(d) 
                              return d[1]
                            })
                            .join('rect')
                            .classed('movie_bar',true)
                            .attr('id',function(d){
                              //console.log(d)
                              return d.originalTitle
                            })
                            .attr('width',function(d,i,j){return bar_scale(d.Count)})
                            .attr('height',bar_h)
                            .attr('x', function(d,i,j){
                              if(i>0){
                                pre_x_pos += j[i-1].width.baseVal.value + 5
                              }
                              else{pre_x_pos = 0}
                              return pre_x_pos + 16*bar_margin
                            })
                            .attr('y',-((bar_h+bar_space)/2))
                            .attr('fill',function(d,i){
                              if(i == 0){return '#ffe06e'}
                              else if(i == 1){return '#fbdce2'}
                              else if(i == 2){return '#8de7fd'}
                            })
                            .attr('opacity',function(d){
                              if(new_movie_name.includes(d.originalTitle)){
                                return 1
                              }
                              else{return 0.2}
                            })
                      //console.log(new_movie_name)
                            
                      return writers.attr('opacity',1)
                  },
                  function(update){
                    //console.log(update)
                    let writers = update
                    /*writers.attr('transform', function(d,i){
                              let y = (i+1)*(bar_h+bar_space)+bar_margin
                              return 'translate(0,' + y +')'
                            })*/
                    writers.selectAll('.writer_name')
                            .text(function(d){return d[0]})
                            .attr('x',12*bar_margin)
                            .attr('text-anchor','end')
                            .attr('dominant-baseline','middles')
                            .attr('fill','white')
                            .attr('font-weight',600)
                    writers.selectAll('.total')
                            .text(function(d){
                              let total = 0
                              for(i of d[1]){
                                if(new_movie_name.includes(i.originalTitle)){
                                  total += i.Count
                                }
                              }
                              return total
                            })
                            .attr('x',13*bar_margin)
                            .attr('text-anchor','starts')
                            .attr('dominant-baseline','middles')
                            .attr('fill','white')
                            .attr('font-size', '18px')
                            .attr('font-weight',600)

                    //bind each writer's data to draw bar
                    pre_x_pos = 0
                    writers.selectAll('.movie_bar')
                            .attr('width',function(d,i,j){
                              return bar_scale(d.Count)
                            })
                            .attr('height',bar_h)
                            .attr('x', function(d,i,j){
                              if(i>0){
                                pre_x_pos += j[i-1].width.baseVal.value + 5
                              }
                              else{pre_x_pos = 0}
                              return pre_x_pos + 16*bar_margin
                            })
                            .attr('y',-((bar_h+bar_space)/2))
                            .attr('fill',function(d,i){
                              if(i == 0){return '#ffe06e'}
                              else if(i == 1){return '#fbdce2'}
                              else if(i == 2){return '#8de7fd'}
                            })
                            .attr('opacity',function(d){
                              if(new_movie_name.includes(d.originalTitle)){
                                return 1
                              }
                              else{return 0.2}
                            })
         
                    return writers.attr('opacity',1)
                  },
                  function(exit){
                    return exit.attr('opacity',0.2)
                  }
                )
              
              //hover on the bar
              d3.selectAll('.movie_bar')
                  .on('mouseover',function(e,d){
                    let x_pos = e.target.x.baseVal.value + e.target.width.baseVal.value/2

                    console.log(d)

                    d3.select(e.target)
                      .attr('stroke','white')
                      .attr('stroke-width','2px')

                    d3.select(e.target.parentElement)
                      .append('text')
                      .attr('id','bar_info')
                      .text(d.originalTitle + ' (' + d.Count + ')')
                      .attr('text-anchor','middle')
                      .attr('x',x_pos)
                    
                     d3.select('#movie_genre')
                        .html( 'Original Title : '+ d.originalTitle + 
                          '</br> Genere : &nbsp' + d.genres + 
                          '</br> Runing Time : &nbsp'+ d.time+ ' min'+
                          '</br> Year : &nbsp'+ d.Year +
                          '</br> Rating : &nbsp'+ d.Rating )
                      
                    //console.log(e.target.x.baseVal.value)
                    //console.log(d)
                  })
                  .on('mouseout',function(e,d){
                    //console.log(e)
                    d3.select(e.target)
                      .attr('stroke', 'none')

                    d3.select('#bar_info').remove()
                  })
              }
      
          
          var genre_check=[]
          for(let i=0; i<filterGenre.length; i++){
            genre_check.push(1)
          }



          var updateBar=[]

          //create switches group (switch + text)
          d3.select('.switches')
            .selectAll('g')
            .data(filterGenre)
            .join('g')
            .classed('switch_group',true)
          //create switch
          d3.selectAll('.switch_group')
              .append('input')
              .attr('type','checkbox')
              .attr('id',function(d,i){
                return 'check'+i
              })
              .attr('checked',true)
              .on('mouseup',function(e,d,i){
                let genre_index = parseInt(e.target.id.replace('check',''))
                let genre_id = e.target.id
                //console.log(document.getElementById(genre_id).checked)
                if(document.getElementById(genre_id).checked){
                  genre_check[genre_index] = 0
                }
                else{
                  genre_check[genre_index] = 1
                }
                UpdateGenre()
                console.log(genre_check)
                drawBar(updateBar)
                previewBarUpdate(new_writer_data)
  
              })

            console.log(genre_check)
            
          d3.selectAll('.switch_group')
              .append('text')
              .text(function(d){return d})
          
          d3.select('.switches')
            .append('g')
            .classed('switch_group',true)
            .attr('id','all_check')
            .append('input')
            .attr('type','checkbox')
            .attr('checked',true)
            .on('mouseup',function(e,d,i){
                if(e.target.checked){
                  for(let a=0; a<genre_check.length; a++){
                    genre_check[a] = 0
                    //console.log(genre_check)
                    document.getElementById('check'+a).checked = false
                  }
                }
                else{
                  for(let a=0; a<genre_check.length; a++){
                    genre_check[a] = 1
                    document.getElementById('check'+a).checked = true
                  }
                  
                }
                //console.log(genre_check)
                UpdateGenre()
                //console.log(e.target.checked)
                drawBar(updateBar)
                previewBarUpdate(new_writer_data)
  
              })
           
          
          d3.select('#all_check')
            .append('text')
            .text('All Genres')
          
          
          //console.log(writer_dataset)
          function UpdateGenre(){
            updateBar = writer_dataset.filter(function(d,i){
              let test = false
              for(let i=0; i<filterGenre.length; i++){
                if(genre_check[i]){
                  test = test || d.genres.includes(filterGenre[i])
                }
              }
              return test
            })
          }        
      

          drawBar(writer_dataset)
          initBarBrush()
          //console.log(new_movie_name)
          previewBarUpdate(new_writer_data)
    }
