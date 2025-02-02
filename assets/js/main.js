/*
* This code has evolved from an early version of Memos, gradually adding features. If refactoring from the current version,
* it could be reduced by at least 2/3. For integration into your own blog or webpage, only a portion is needed.
* You can now easily generate elegant and concise code from scratch using GPT.
*/

// Memos Start
var memo = {
    host: 'https://demo.usememos.com/',
    limit: '10',
    creatorId: '101',
    domId: '#memos',
    username: 'Admin',
    name: 'Administrator',
    APIVersion: 'new',
    language: 'en',
    total: true,
    doubanAPI: '',
}
if (typeof (memos) !== "undefined") {
    for (var key in memos) {
        if (memos[key]) {
            memo[key] = memos[key];
        }
    }
}

var limit = memo.limit
var memos = memo.host.replace(/\/$/, '')

let memoUrl;
if (memo.APIVersion === 'new') {
    const filter = `creator=='users/${memo.creatorId}'&&visibilities==['PUBLIC']`;
    memoUrl = `${memos}/api/v1/memos?filter=${encodeURIComponent(filter)}&view=MEMO_VIEW_FULL`;
} else if (memo.APIVersion === 'legacy') {
    memoUrl = memos + "/api/v1/memo?creatorId=" + memo.creatorId + "&rowStatus=NORMAL";
} else {
    throw new Error('Invalid APIVersion');
}

var page = 1,
    offset = 0,
    nextLength = 0,
    nextDom = '';
var tag='';
var nextPageToken = '';
var btnRemove = 0
var memoDom = document.querySelector(memo.domId);
var load = '<button class="load-btn button-load">Loading...</button>'
var noMoreMessage = '<div class="no-more-notes">No more notes available</div>'

if (memoDom) {
    memoDom.insertAdjacentHTML('afterend', load);
    getFirstList() // Initial data load
    // Add button event listener
    btnRemove = 0;
    var btn = document.querySelector("button.button-load");
    btn.addEventListener("click", function () {
        btn.textContent = 'Loading...';
        if (nextDom && nextDom.length > 0) {
            updateHTMl(nextDom);
            getNextList();
        } else {
            document.querySelector("button.button-load").remove();
            memoDom.insertAdjacentHTML('afterend', noMoreMessage);
            btnRemove = 1;
        }
    });
}

function getFirstList() {
    let memoUrl_first;
    if (memo.APIVersion === 'new') {
        memoUrl_first = memoUrl + '&pageSize=' + limit;
        fetch(memoUrl_first).then(res => res.json()).then(resdata => {
            updateHTMl(resdata)
            nextPageToken = resdata.nextPageToken;
            var nowLength = resdata.length
            if (nowLength < limit) { // Returned data count is less than the limit, remove "Load more" button and stop preloading
                document.querySelector("button.button-load").remove()
                memoDom.insertAdjacentHTML('afterend', noMoreMessage);
                btnRemove = 1
                return
            }
            page++
            getNextList()
        });
    } else if (memo.APIVersion === 'legacy') {
        memoUrl_first = memoUrl + "&limit=" + limit;
        fetch(memoUrl_first).then(res => res.json()).then(resdata => {
            updateHTMl(resdata)
            var nowLength = resdata.length
            if (nowLength < limit) { // Returned data count is less than the limit, remove "Load more" button and stop preloading
                document.querySelector("button.button-load").remove()
                memoDom.insertAdjacentHTML('afterend', noMoreMessage);
                btnRemove = 1
                return
            }
            page++
            offset = limit * (page - 1)
            getNextList()
        });
    } else {
        throw new Error('Invalid APIVersion');
    }
}

// Preload next page data
function getNextList() {
    if (memo.APIVersion === 'new') {
        var memoUrl_next = memoUrl + '&pageSize=' + limit + '&pageToken=' + nextPageToken;
        fetch(memoUrl_next).then(res => res.json()).then(resdata => {
            if (resdata && resdata.length > 0) {
                nextDom = resdata;
                nextLength = nextDom.length;
                nextPageToken = resdata.nextPageToken;
                
                if (nextLength < limit) {
                    document.querySelector("button.button-load").remove();
                    memoDom.insertAdjacentHTML('afterend', noMoreMessage);
                    btnRemove = 1;
                }
            } else {
                document.querySelector("button.button-load").remove();
                memoDom.insertAdjacentHTML('afterend', noMoreMessage);
                btnRemove = 1;
            }
        }).catch(error => {
            console.error('Error fetching next page:', error);
            document.querySelector("button.button-load").remove();
            memoDom.insertAdjacentHTML('afterend', '<div class="no-more-notes">Error loading notes</div>');
            btnRemove = 1;
        });
        
    } else if (memo.APIVersion === 'legacy') {
        if (tag){
            var memoUrl_next = memoUrl + "&limit=" + limit + "&offset=" + offset + "&tag=" + tag;
        } else {
            var memoUrl_next = memoUrl + "&limit=" + limit + "&offset=" + offset;
        }
        fetch(memoUrl_next).then(res => res.json()).then(resdata => {
            if (resdata && resdata.length > 0) {
                nextDom = resdata
                nextLength = nextDom.length
                page++
                offset = limit * (page - 1)
                
                if (nextLength < limit) {
                    document.querySelector("button.button-load").remove();
                    memoDom.insertAdjacentHTML('afterend', noMoreMessage);
                    btnRemove = 1;
                }
            } else {
                document.querySelector("button.button-load").remove();
                memoDom.insertAdjacentHTML('afterend', noMoreMessage);
                btnRemove = 1;
            }
        }).catch(error => {
            console.error('Error fetching next page:', error);
            document.querySelector("button.button-load").remove();
            memoDom.insertAdjacentHTML('afterend', '<div class="no-more-notes">Error loading notes</div>');
            btnRemove = 1;
        })
    } else {
            throw new Error('Invalid APIVersion');
    }
}

// Tag selection
document.addEventListener('click', function (event) {
    var target = event.target;
    if (target.tagName.toLowerCase() === 'a' && target.getAttribute('href').startsWith('#')) {
        event.preventDefault();
        tag = target.getAttribute('href').substring(1); // Get tag name
        if (btnRemove) {    // If button is removed
            btnRemove = 0;
            memoDom.insertAdjacentHTML('afterend', load);
            // Add button event listener
            var btn = document.querySelector("button.button-load");
            btn.addEventListener("click", function () {
                btn.textContent = 'Loading...';
                if (nextDom && nextDom.length > 0) {
                    updateHTMl(nextDom);
                    getNextList();
                } else {
                    document.querySelector("button.button-load").remove();
                    memoDom.insertAdjacentHTML('afterend', noMoreMessage);
                    btnRemove = 1;
                }
            });
            
        }        
        getTagFirstList();
        var filterElem = document.getElementById('tag-filter');
        filterElem.style.display = 'block';    // Show filter
        var tags = document.getElementById('tags');
        var tagresult = `Filter: <span class='tag-span'><a rel='noopener noreferrer' href=''>#${tag}</a></span>`
        tags.innerHTML = tagresult;
        scrollTo(0,0);    // Go to top
    }
});

function getTagFirstList() {
    if (memo.APIVersion === 'new') {
        console.log('Could not list tag')
    } else if (memo.APIVersion === 'legacy') {
        page = 1;
        offset = 0;
        nextLength = 0;
        nextDom = '';
        memoDom.innerHTML = "";
        var memoUrl_tag = memoUrl + "&limit=" + limit + "&tag=" + tag;
        fetch(memoUrl_tag).then(res => res.json()).then(resdata => {
            updateHTMl(resdata);
            var nowLength = resdata.length
            if (nowLength < limit) { // Returned data count is less than the limit, remove "Load more" button and stop preloading
                document.querySelector("button.button-load").remove()
                memoDom.insertAdjacentHTML('afterend', noMoreMessage);
                btnRemove = 1
                return
            }
            page++
            offset = limit * (page - 1)
            getNextList()
        });
    } else {
        throw new Error('Invalid APIVersion');
    }
}
// Tag selection end

// Insert HTML
function updateHTMl(data) {
    var memoResult = "", resultAll = "";

    // Parse TAG tag, add style
    const TAG_REG = /#([^\s#]+?) /g;

    // Parse Bilibili
    const BILIBILI_REG = /<a\shref="https:\/\/www\.bilibili\.com\/video\/((av[\d]{1,10})|(BV([\w]{10})))\/?">.*<\/a>/g;
    // Parse NetEase Music
    const NETEASE_MUSIC_REG = /<a\shref="https:\/\/music\.163\.com\/.*id=([0-9]+)".*?>.*<\/a>/g;
    // Parse QQ Music
    const QQMUSIC_REG = /<a\shref="https\:\/\/y\.qq\.com\/n\/yqq\/song$1.html".*?>.*?<\/a>/g;
    // Parse Tencent Video
    const QQVIDEO_REG = /<a\shref="https:\/\/v\.qq\.com\/.*\/([a-z|A-Z|0-9]+)\.html".*?>.*<\/a>/g;
    // Parse Spotify
    const SPOTIFY_REG = /<a\shref="https:\/\/open\.spotify\.com\/(track|album)\/([\s\S]+)".*?>.*<\/a>/g;
    // Parse Youku Video
    const YOUKU_REG = /<a\shref="https:\/\/v\.youku\.com\/.*\/id_([a-z|A-Z|0-9|==]+)\.html".*?>.*<\/a>/g;
    // Parse YouTube
    const YOUTUBE_REG = /<a\shref="https:\/\/www\.youtube\.com\/watch\?v\=([a-z|A-Z|0-9]{11})\".*?>.*<\/a>/g;

    // Memos Content
    if (memo.APIVersion === 'new') {
        data = data.memos
    } else if (memo.APIVersion === 'legacy') {
        data = data
    } else {
            throw new Error('Invalid APIVersion');
    }
    for (var i = 0; i < data.length; i++) {
        if (memo.APIVersion === 'new') {
            var uId = data[i].uid
        } else if (memo.APIVersion === 'legacy') {
            var uId = data[i].id
        } else {
                throw new Error('Invalid APIVersion');
        }
        var memoContREG = data[i].content
            .replace(TAG_REG, "<span class='tag-span'><a rel='noopener noreferrer' href='#$1'>#$1</a></span>")

        memoContREG = marked.parse(memoContREG)
            .replace(BILIBILI_REG, "<div class='video-wrapper'><iframe src='//www.bilibili.com/blackboard/html5mobileplayer.html?bvid=$1&as_wide=1&high_quality=1&danmaku=0' scrolling='no' border='0' frameborder='no' framespacing='0' allowfullscreen='true' style='position:absolute;height:100%;width:100%;'></iframe></div>")
            .replace(YOUTUBE_REG, "<div class='video-wrapper'><iframe src='https://www.youtube.com/embed/$1' title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen title='YouTube Video'></iframe></div>")
            .replace(NETEASE_MUSIC_REG, "<meting-js auto='https://music.163.com/#/song?id=$1'></meting-js>")
            .replace(QQMUSIC_REG, "<meting-js auto='https://y.qq.com/n/yqq/song$1.html'></meting-js>")
            .replace(QQVIDEO_REG, "<div class='video-wrapper'><iframe src='//v.qq.com/iframe/player.html?vid=$1' allowFullScreen='true' frameborder='no'></iframe></div>")
            .replace(SPOTIFY_REG, "<div class='spotify-wrapper'><iframe style='border-radius:12px' src='https://open.spotify.com/embed/$1/$2?utm_source=generator&theme=0' width='100%' frameBorder='0' allowfullscreen='' allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture' loading='lazy'></iframe></div>")
            .replace(YOUKU_REG, "<div class='video-wrapper'><iframe src='https://player.youku.com/embed/$1' frameborder=0 'allowfullscreen'></iframe></div>")
            .replace(YOUTUBE_REG, "<div class='video-wrapper'><iframe src='https://www.youtube.com/embed/$1' title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen title='YouTube Video'></iframe></div>")

        // Parse built-in resource files
        if (memo.APIVersion === 'new') {
            if (data[i].resources && data[i].resources.length > 0) {
                var resourceList = data[i].resources; 
                var imgUrl = '', resUrl = '';

                imgUrl += '<div class="resource-wrapper"><div class="images-wrapper" style="display: flex; flex-wrap: wrap; gap: 10px;">';

                for (var j = 0; j < resourceList.length; j++) {
                    var resType = resourceList[j].type.slice(0, 5);
                    var resexlink = resourceList[j].externalLink;
                    var resLink = '';
                    var filename = resourceList[j].filename;
                    var name = resourceList[j].name; 

                    if (resType === 'image') {
                        if (resexlink) {
                            imgUrl += '<div class="resimg" style="flex: 1 1 calc(33.33% - 10px); overflow: hidden; position: relative; height: 200px;">' +
                                '<img loading="lazy" src="' + resexlink + '" style="width: 100%; height: 100%; object-fit: contain; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"/>' +
                                '</div>';
                        } else {
                            resLink = memos + '/file/' + name + '/' + filename;
                            imgUrl += '<div class="resimg" style="flex: 1 1 calc(33.33% - 10px); overflow: hidden; position: relative; height: 200px;">' +
                                '<img loading="lazy" src="' + resLink + '" style="width: 100%; height: 100%; object-fit: contain; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"/>' +
                                '</div>';
                        }
                    } else {
                        resLink = memos + '/file/' + name + '/' + filename;
                        resUrl += '<a target="_blank" rel="noreferrer" href="' + resLink + '">' + filename + '</a>';
                    }
                }

                imgUrl += '</div></div>'; 

                if (imgUrl) {
                    memoContREG += imgUrl;
                }
                if (resUrl) {
                    memoContREG += '<div class="resource-wrapper"><p class="datasource">' + resUrl + '</p></div>';
                }
            }
        } else if (memo.APIVersion === 'legacy') {
            if (data[i].resourceList && data[i].resourceList.length > 0) {
                var resourceList = data[i].resourceList;
                var imgUrl = '', resUrl = '', resImgLength = 0;
                for (var j = 0; j < resourceList.length; j++) {
                    var resType = resourceList[j].type.slice(0, 5);
                    var resexlink = resourceList[j].externalLink;
                    var resLink = ''
                    if (resexlink) {
                        resLink = resexlink
                    } else {
                        fileId = resourceList[j].publicId || resourceList[j].filename
                        resLink = memos+'/o/r/'+resourceList[j].id+'/'+fileId
                    }
                    if (resType == 'image') {
                        imgUrl += '<div class="resimg"><img loading="lazy" src="' + resLink + '"/></div>'
                        resImgLength = resImgLength + 1
                    }
                    if (resType !== 'image') {
                        resUrl += '<a target="_blank" rel="noreferrer" href="' + resLink + '">' + resourceList[j].filename + '</a>'
                    }
                }
                if (imgUrl) {
                    var resImgGrid = ""
                    if (resImgLength !== 1) { var resImgGrid = "grid grid-" + resImgLength }
                    memoContREG += '<div class="resource-wrapper "><div class="images-wrapper">' + imgUrl + '</div></div>'
                }
                if (resUrl) {
                    memoContREG += '<div class="resource-wrapper "><p class="datasource">' + resUrl + '</p></div>'
                }
            }
        } else {
                throw new Error('Invalid APIVersion');
        }
        if (memo.APIVersion === 'new') {
            var relativeTime = getRelativeTime(new Date(data[i].createTime));
            var avatarurl = memo.host + 'file/users/' + memo.creatorId + '/avatar'; 
            // New version automatically gets avatar
        } else if (memo.APIVersion === 'legacy') {
            var relativeTime = getRelativeTime(new Date(data[i].createdTs * 1000));
            var avatarurl = '../img/avatar.jpg';
            // Old version customizes avatar
        } else {
                throw new Error('Invalid APIVersion');
        }
        memoResult += '<li class="timeline"><div class="memos__content" style="--avatar-url: url(' + avatarurl + ')"><div class="memos__text"><div class="memos__userinfo"><div>' + memo.name + '</div><div><svg viewBox="0 0 24 24" aria-label="Verified account" class="memos__verify"><g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"></path></g></svg></div><div class="memos__id">@' + memo.username + '</div></div><p>' + memoContREG + '</p></div><div class="memos__meta"><small class="memos__date">' + relativeTime + ' • From「<a href="' + memo.host + 'm/' + uId + '" target="_blank">Memos</a>」</small></div></div></li>'
    }
    var memoBefore = '<ul class="">'
    var memoAfter = '</ul>'
    resultAll = memoBefore + memoResult + memoAfter
    memoDom.insertAdjacentHTML('beforeend', resultAll);
    if (memo.doubanAPI) {
        fetchDB();
    }
    document.querySelector('button.button-load').textContent = 'Load more';
}
// Memos End

// Parse Douban Start
// Display Douban items in articles https://immmmm.com/post-show-douban-item/
// Parsing Douban requires API, ask a friend for permission or set up your own API according to https://github.com/eallion/douban-api-rs, very simple and low resource consumption
// Built-in styles, modify API to use
function fetchDB() {
    var dbAPI = memo.doubanAPI;
    var dbA = document.querySelectorAll(".timeline a[href*='douban.com/subject/']:not([rel='noreferrer'])") || '';
    if (dbA) {
        for (var i = 0; i < dbA.length; i++) {
            _this = dbA[i]
            var dbHref = _this.href
            var db_reg = /^https\:\/\/(movie|book)\.douban\.com\/subject\/([0-9]+)\/?/;
            var db_type = dbHref.replace(db_reg, "$1");
            var db_id = dbHref.replace(db_reg, "$2").toString();
            if (db_type == 'movie') {
                var this_item = 'movie' + db_id;
                var url = dbAPI + "movies/" + db_id;
                if (localStorage.getItem(this_item) == null || localStorage.getItem(this_item) == 'undefined') {
                    fetch(url).then(res => res.json()).then(data => {
                        let fetch_item = 'movies' + data.sid;
                        let fetch_href = "https://movie.douban.com/subject/" + data.sid + "/"
                        localStorage.setItem(fetch_item, JSON.stringify(data));
                        movieShow(fetch_href, fetch_item)
                    });
                } else {
                    movieShow(dbHref, this_item)
                }
            } else if (db_type == 'book') {
                var this_item = 'book' + db_id;
                var url = dbAPI + "v2/book/id/" + db_id;
                if (localStorage.getItem(this_item) == null || localStorage.getItem(this_item) == 'undefined') {
                    fetch(url).then(res => res.json()).then(data => {
                        let fetch_item = 'book' + data.id;
                        let fetch_href = "https://book.douban.com/subject/" + data.id + "/"
                        localStorage.setItem(fetch_item, JSON.stringify(data));
                        bookShow(fetch_href, fetch_item)
                    });
                } else {
                    bookShow(dbHref, this_item)
                }
            }
        }// for end
    }
}

function movieShow(fetch_href, fetch_item) {
    var storage = localStorage.getItem(fetch_item);
    var data = JSON.parse(storage);
    var db_star = Math.ceil(data.rating);
    var db_html = "<div class='post-preview'><div class='post-preview--meta'><div class='post-preview--middle'><h4 class='post-preview--title'><a target='_blank' rel='noreferrer' href='" + fetch_href + "'>《" + data.name + "》</a></h4><div class='rating'><div class='rating-star allstar" + db_star + "'></div><div class='rating-average'>" + data.rating + "</div></div><time class='post-preview--date'>Director：" + data.director + " / Type：" + data.genre + " / " + data.year + "</time><section class='post-preview--excerpt'>" + data.intro.replace(/\s*/g, "") + "</section></div></div><img referrer-policy='no-referrer' loading='lazy' class='post-preview--image' src=" + data.img + "></div>"
    var db_div = document.createElement("div");
    var qs_href = ".timeline a[href='" + fetch_href + "']"
    var qs_dom = document.querySelector(qs_href)
    qs_dom.parentNode.replaceChild(db_div, qs_dom);
    db_div.innerHTML = db_html
}

function bookShow(fetch_href, fetch_item) {
    var storage = localStorage.getItem(fetch_item);
    var data = JSON.parse(storage);
    var db_star = Math.ceil(data.rating.average);
    var db_html = "<div class='post-preview'><div class='post-preview--meta'><div class='post-preview--middle'><h4 class='post-preview--title'><a target='_blank' rel='noreferrer' href='" + fetch_href + "'>《" + data.title + "》</a></h4><div class='rating'><div class='rating-star allstar" + db_star + "'></div><div class='rating-average'>" + data.rating.average + "</div></div><time class='post-preview--date'>Author：" + data.author + " </time><section class='post-preview--excerpt'>" + data.summary.replace(/\s*/g, "") + "</section></div></div><img referrer-policy='no-referrer' loading='lazy' class='post-preview--image' src=" + data.images.medium + "></div>"
    var db_div = document.createElement("div");
    var qs_href = ".timeline a[href='" + fetch_href + "']"
    var qs_dom = document.querySelector(qs_href)
    qs_dom.parentNode.replaceChild(db_div, qs_dom);
    db_div.innerHTML = db_html
}
// Parse Douban End

// Images lightbox
window.ViewImage && ViewImage.init('.container img');

// Memos Total Start
// Get Memos total count
function getTotal() {
    let pageUrl;
    let totalUrl;
    if (memo.APIVersion === 'new') {
        const filter = `creator=='users/${memo.creatorId}'&&visibilities==['PUBLIC']`;
        pageUrl = `${memos}/api/v1/memos?pageSize=1&pageToken=&&filter=${encodeURIComponent(filter)}`;
        fetch(pageUrl)
            .then(res => res.json())
            .then(resdata => {
                if (resdata && resdata.memos) {
                    var pageSize = resdata.memos.map(memo => {
                        const match = memo.name.match(/\d+/);
                        return match ? parseInt(match[0], 10) : null;
                    }).filter(num => num !== null)[0]; // Get the first matched number

                    if (pageSize) {
                        // Second request: use the obtained pageSize
                        totalUrl = `${memos}/api/v1/memos?pageSize=${pageSize}&filter=${encodeURIComponent(filter)}`;
                        return fetch(totalUrl);
                    } else {
                        throw new Error('No valid pageSize found');
                    }
                }
            })
            .then(res => res.json())
            .then(resdata => {
                if (resdata && resdata.memos) {
                    var allnums = resdata.memos.length;
                    var memosCount = document.getElementById('total');
                    if (memosCount) {
                        memosCount.innerHTML = allnums;
                    }
                }
            })
            .catch(err => {
                console.error('Error fetching memos:', err);
            });
    } else if (memo.APIVersion === 'legacy') {
        totalUrl = `${memos}/api/v1/memo/stats?creatorId=${memo.creatorId}`;
        fetch(totalUrl)
            .then(res => res.json())
            .then(resdata => {
                if (resdata) {
                    var allnums = resdata.length;
                    var memosCount = document.getElementById('total');
                    if (memosCount) {
                        memosCount.innerHTML = allnums;
                    }
                }
            })
            .catch(err => {
                console.error('Error fetching memos:', err);
            });
    } else {
        throw new Error('Invalid APIVersion');
    }
}

if (memo.total === true) {
    window.onload = getTotal;
} else {
    var totalDiv = document.querySelector('div.total');
    if (totalDiv) {
        totalDiv.remove();
    }
}
// Memos Total End

// Relative Time Start
function getRelativeTime(date) {
    const rtf = new Intl.RelativeTimeFormat(memos.language, { numeric: "auto", style: 'short' });

    const now = new Date();
    const diff = now - date;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
        return rtf.format(-years, 'year');
    } else if (months > 0) {
        return rtf.format(-months, 'month');
    } else if (days > 0) {
        return rtf.format(-days, 'day');
    } else if (hours > 0) {
        return rtf.format(-hours, 'hour');
    } else if (minutes > 0) {
        return rtf.format(-minutes, 'minute');
    } else {
        return rtf.format(-seconds, 'second');
    }
}
// Relative Time End

// Toggle Darkmode
const localTheme = window.localStorage && window.localStorage.getItem("theme");
const themeToggle = document.querySelector(".theme-toggle");

if (localTheme) {
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(localTheme);
}

themeToggle.addEventListener("click", () => {
    const themeUndefined = !new RegExp("(dark|light)-theme").test(document.body.className);
    const isOSDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (themeUndefined) {
        if (isOSDark) {
            document.body.classList.add("light-theme");
        } else {
            document.body.classList.add("dark-theme");
        }
    } else {
        document.body.classList.toggle("light-theme");
        document.body.classList.toggle("dark-theme");
    }

    window.localStorage &&
        window.localStorage.setItem(
            "theme",
            document.body.classList.contains("dark-theme") ? "dark-theme" : "light-theme",
        );
});
// Darkmode End
