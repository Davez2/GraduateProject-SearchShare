/* 捜索状況共有 - アプリ本体。CSP（script-src 'self'）のため index.html から分離した */
(function(){
"use strict";
var $=function(i){return document.getElementById(i)};
var $$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
var mem={};
var S={get:function(k){try{var v=localStorage.getItem(k);return v?JSON.parse(v):(mem[k]||null)}catch(e){return mem[k]||null}},
 set:function(k,v){mem[k]=v;try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
var esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};

/* ---------- i18n（日本語 / English） ---------- */
var I18N={
ja:{title:"捜索状況共有",login:"ログイン",register:"新規登録",team:"隊名",id:"ID",password:"パスワード",startReg:"登録して開始",
 shareQR:"QRで共有",theme:"昼/夜",logout:"ログアウト",map:"地図",zoomIn:"拡大",zoomOut:"縮小",toMe:"現在地へ",tapMap:"地図をタップ",
 pinHere:"現在地にピン",pickMap:"地図で選ぶ",byAddress:"住所で探す",share:"共有",copy:"コピー",copied:"コピー済み",close:"閉じる",save:"保存",del:"削除",
 status:"状況",st0:"未捜索",st1:"捜索中",st2:"捜索済み",st2s:"済",entry:"進入",goYes:"可",goNo:"不可",missing:"行方不明 M",live:"生存 L",dead:"死亡 D",dec:"減らす",inc:"増やす",inc10:"10増やす",
 name:"建物名",namePh:"B棟",floor:"階",floorPh:"1F / 1〜3F",address:"住所",addrPh:"自動で入力されます",addrGet:"住所取得",
 hazard:"危険情報",hazardPh:"ガス漏れ など",note:"メモ",notePh:"要救助者の位置、進入経路 など",startT:"捜索開始",endT:"捜索終了",now:"今",
 newPin:"ピンを設置",editPin:"ピンを編集",created:"作成",updated:"最終更新",unsent:"未送信",
 dupWarn:"30m以内に既存のピンがあります。同じ建物を重複して捜索していないか確認してください",
 nameReq:"建物名を入力してください",saved:"保存しました",saveFail:"保存に失敗しました",deleted:"削除しました",delFail:"削除に失敗しました",
 delForbidden:"他の隊のピンは削除できません",delOffline:"オフライン中は削除できません",queued:"オフライン：接続が戻ったら自動で送信します",sent:"未送信のデータを送信しました",
 gpsFallback:"GPS不可：地図の中心に設置",gpsFail:"GPSを取得できません",loadFail:"ピンを取得できませんでした",sessionExpired:"セッションが切れました。再度ログインしてください",
 teamReq:"隊名を入力してください",idRule:"IDは英数字3〜20文字",pwRule:"パスワードは6文字以上",idTaken:"このIDは使われています",badCred:"IDまたはパスワードが違います",
 missingIn:"入力に不足があります",noServer:"サーバーに接続できません。通信状況を確認してください",serverErr:"サーバーエラーが発生しました（{code}）",none:"該当なし",unnamed:"（名称未設定）",
 synced:"同期 {time}",offline:"オフライン",pending:"未送信 {n}件",allTeams:"全隊",myTeam:"自隊",filterLabel:"表示する隊",
 addrSearchPh:"住所・施設名",search:"検索",searching:"検索中…",noResult:"見つかりませんでした",geoFail:"住所検索に失敗しました",
 otherUpdated:"このピンは他のユーザーに更新されました。保存すると上書きされます",qrFail:"QRコードを読み込めませんでした（インターネット接続を確認）",
 layerLabel:"地図の種類",layerOsm:"OSM",layerStd:"地理院地図",layerPale:"地理院 淡色",layerPhoto:"航空写真",
 unsavedTitle:"変更が保存されていません",unsavedClose:"このまま閉じると、入力した内容は失われます。",unsavedMove:"このまま別のピンへ移動すると、入力した内容は失われます。",
 keepEditing:"編集を続ける",discardClose:"破棄して閉じる",discardMove:"破棄して移動",showAll:"全て表示",filterOnly:"{s}だけ表示",
 shareOn:"位置共有：ON",shareOff:"位置共有：OFF",teamsOn:"隊の位置：表示",teamsOff:"隊の位置：非表示",
 nearTeams:"近い隊（応援の候補）",nearNone:"位置を共有している隊がありません",justNow:"たった今",agoMin:"{n}分前",agoHour:"{n}時間前",
 roleLegend:"登録の種類",roleMember:"隊員として登録",roleHq:"本部として登録",hqCode:"本部用の合言葉",hqCodeReq:"本部用の合言葉を入力してください",badHqCode:"本部用の合言葉が違います",hqDisabled:"このサーバーでは本部として登録できません",hqTag:"本部",
 detailBtn:"詳しく入力",qSt0:"□\n未捜索",qSt1:"◪\n捜索中",qSt2:"■\n捜索済み",
 floorsT:"階数",floorsHint:"階ごと・店舗ごとに状況を分けて入力できます。",floorsNone:"階数なし",floorsInput:"階数を入力",above:"地上",below:"地下",floorUnit:"階",makeTabs:"{n}階分のタブを作る",makeNone:"階数を入れてください",
 floorsOffTitle:"階数をやめますか",floorsOffMsg:"階数と、階ごとの入力内容が消えます。",floorsOffOk:"消して階数なしにする",floorsHqOnly:"保存した階数を消せるのは本部だけです",
 doneOf:"捜索済み {n} / {m}階",floorLabelPh:"例：中2階、屋上",addFloorOk:"＋ 階を追加",floorDup:"同じ名前の階があります",floorDel:"この階を削除",
 shopsT:"店舗・区画",shopsIn:"（この階の中）",addShop:"＋ 店舗・区画を追加",shopName:"店舗・区画の名前",shopNamePh:"店舗A",shopDel:"この店舗・区画を削除",shopNameReq:"店舗・区画の名前を入力してください",
 floorNote:"メモ（この階）",bldNote:"メモ（建物）",totals:"人数（店舗・区画の合計）",autoTag:"自動",
 autoRule:"・捜索中が1つでもあれば、捜索中|・全部が未捜索のときだけ、未捜索|・全部が捜索済みのときだけ、捜索済み|・未捜索と捜索済みが混ざっているときは、捜索中",
 shopOnlyHint:"進入・危険情報・捜索開始/終了・人数は、店舗・区画の中で入力します。",
 delTitle:"削除しますか",delFloorMsg:"この階と、中の店舗・区画の内容が消えます。",delShopMsg:"この店舗・区画の内容が消えます。",delOk:"削除する",
 victims:"要救助者（V）",vAdd:"＋ Vを追加",vNone:"登録なし",vSaveFirst:"ピンを保存すると、要救助者（V）と写真を追加できます",
 vNew:"要救助者を追加",vEdit:"要救助者（V）",vs0:"V 可能性あり",vs1:"L 生存確認",vs2:"D 死亡確認",vs3:"救出済み",
 vPlace:"位置",vAtPin:"建物の位置",vAtGps:"現在地",vAtMap:"地図で指定",vTapMap:"要救助者の位置をタップ",
 vNotePh:"例：北東の部屋、呼びかけに応答",offlineNoSave:"オフライン中は保存できません",delOther:"他の隊が追加したものは削除できません",cancel:"キャンセル",
 photos:"写真",phAdd:"＋ 写真",phNone:"写真なし",phUploading:"送信中…",phFail:"写真を送信できませんでした",phTooBig:"写真が大きすぎます",phLoadFail:"写真を読み込めません",
 offlineSince:"オフライン（最終同期 {time}）",
 navModeOn:"道順：ON",navModeOff:"道順：OFF",routeInfo:"道順・徒歩 約{min}分",routeLoading:"道順を取得中…",routeOffline:"圏外のため直線で案内（つながると道順に切り替え）",
 routeNone:"道順が見つかりません（直線で案内）",routeFar:"遠すぎるため直線で案内",routeFail:"道順を取得できません（直線で案内）",routeOff:"道から外れています",routeRe:"道順を検索し直しています…",
 navNext:"{d}先で{turn}",navNow:"まもなく{turn}",navAlong:"道なりに進む",navOnto:"（{name}）",
 turnL:"左折",turnR:"右折",turnSL:"斜め左へ",turnSR:"斜め右へ",turnHL:"大きく左へ",turnHR:"大きく右へ",turnU:"引き返す",turnRb:"ロータリーへ",
 routeAttr:'道順：<a href="https://routing.openstreetmap.de/about.html" target="_blank" rel="noopener">FOSSGIS/OSRM</a>（<a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noopener">地図の誤りを報告</a>）',
 navGo:"ここへナビ",navTo:"目的地：{name}",navDir:"{dir}の方向・徒歩 約{min}分（直線）",navAcc:"GPS ±{m}m",navStale:"GPS更新なし {s}秒",
 navPoint:"地図上の地点",ptTitle:"選んだ地点",navShort:"ナビ",teamPosH:"隊の位置",navTeam:"この隊へナビ",fromHere:"ここから {d}",navTeamAge:"相手の位置：{age}",
 hintLongPress:"ヒント：地図を長押し（パソコンは右クリック）すると、その地点へナビできます",
 navNorthUp:"矢印：地図の上＝北",navCompassOn:"矢印：スマホの向き",navMoveDir:"矢印：進む方向",navWaiting:"現在地を取得中…",navGpsDenied:"位置情報の利用が許可されていません",
 navArrived:"目的地に到着しました",navEnd:"終了",navFit:"全体",navRoute:"地図アプリ",navCompass:"コンパス",navCompassNo:"方位センサーを使えません（地図の上＝北で表示します）",
 dirs:"北,北東,東,南東,南,南西,西,北西",
 offBtn:"保存",offBtnAria:"地図をオフライン用に保存",offTitle:"オフライン用に地図を保存",
 offHelp:"今表示している範囲の地図を、この端末に保存します。圏外でも、保存した範囲は地図が表示されます。保存できるのは国土地理院の地図だけです（OpenStreetMapは規約で一括保存が禁止されているため）。現場に入る前に、担当エリアを表示して保存してください。",
 offLayer:"保存する地図",offEstimate:"約{n}枚・約{mb}MB（拡大レベル {z1}〜{z2}）",offLimited:"範囲が広いため、拡大レベル{z}までにしました。より細かく保存するには、範囲を狭めてください。",
 offTooBig:"範囲が広すぎます。地図をもう少し拡大してから保存してください。",offStart:"保存開始",offCancel:"中止",offProgress:"保存中… {done} / {n}",
 offDone:"保存しました（{n}枚）。",offFailN:"{n}枚は保存できませんでした。",offSwitched:"表示を「{layer}」に切り替えました。",offCancelled:"中止しました（{n}枚まで保存）",
 offSavedH:"保存済みの地図",offSavedN:"{a}か所・{n}枚",offNone:"まだ保存していません",offClear:"保存した地図を削除",offNeedNet:"保存にはインターネット接続が必要です",
 inviteCode:"招待コード（本部からもらったもの）",inviteReq:"招待コードを入力してください",badInvite:"招待コードが正しくないか、使えなくなっています",
 hqTeamName:"本部の名前",hqTeamPh:"本部",hqDefaultName:"本部",adminBtn:"隊管理",admTitle:"隊の管理（本部）",newTeamPh:"新しい隊の名前（例：C隊）",create:"作成",
 teamExists:"同じ名前の隊がすでにあります",teamNameReq:"隊の名前を入力してください",membersN:"隊員 {n}人",noMembers:"まだ隊員がいません",
 copyInvite:"招待をコピー",regen:"コードを再発行",regenConfirm:"もう一度押すと再発行（今のコードは使えなくなります）",tmDisable:"停止",tmEnable:"再開",tmDisabled:"停止中",
 rmMember:"削除",rmConfirm:"もう一度押すと削除",hqAccounts:"本部アカウント",inviteMsg:"【捜索状況共有】{team} への招待\n{url}\n招待コード：{code}",
 copiedInvite:"招待をコピーしました。LINEなどで隊員に送ってください",admFail:"操作に失敗しました",regenDone:"新しいコードを発行しました",teamCreated:"作成しました",
 tmNoTeams:"まだ隊がありません。上の欄から作成してください",admHelp:"隊を作成すると招待コードが発行されます。隊員はそのコードで登録します（コードを知らない人は登録できません）。",
 facLabel:"事前確認の施設",facAll:"施設：すべて",facSchool:"施設：学校",facFactory:"施設：工場",facPower:"施設：発電所",facMall:"施設：商業施設",facOff:"施設：非表示",
 k_hospital:"病院",facHospital:"施設：病院",facBeds:"病床 {n}床",facEmg:"救急あり",
 k_school:"学校",k_factory:"工場",k_power:"発電所・変電所",k_mall:"大型商業施設",facZoom:"地図を拡大すると施設が表示されます",facPin:"この場所にピンを設置",facNoName:"（名称なし）",facAttr:"施設データ",
 s_hospital:"病院",s_school:"学校",s_kindergarten:"幼稚園・保育園",s_university:"大学",s_college:"専門学校・大学",s_plant:"発電所",s_substation:"変電所",
 s_mall:"ショッピングモール",s_department_store:"百貨店",s_retail:"商業施設",s_works:"工場",s_industrial:"工業地域・工場",s_factory:"工場",dec10:"10減らす",totalPeople:"建物の人数（合計）",personsN:"{n}人",
 floorPhotos:"この階の写真",floorPhSave:"ピンを保存すると、階の写真を追加できます",
 lang:"EN",locale:"ja-JP"},
en:{title:"Search Status Share",login:"Log in",register:"Sign up",team:"Team",id:"ID",password:"Password",startReg:"Sign up & start",
 shareQR:"Share via QR",theme:"Day/Night",logout:"Log out",map:"Map",zoomIn:"Zoom in",zoomOut:"Zoom out",toMe:"My location",tapMap:"Tap the map",
 pinHere:"Pin my location",pickMap:"Pick on map",byAddress:"Find address",share:"Share",copy:"Copy",copied:"Copied",close:"Close",save:"Save",del:"Delete",
 status:"Status",st0:"Not searched",st1:"Searching",st2:"Searched",st2s:"Done",entry:"Entry",goYes:"GO",goNo:"NO GO",missing:"Missing M",live:"Alive L",dead:"Dead D",dec:"Decrease",inc:"Increase",inc10:"Increase by 10",
 name:"Building",namePh:"Block B",floor:"Floor",floorPh:"1F / 1-3F",address:"Address",addrPh:"Filled in automatically",addrGet:"Look up",
 hazard:"Hazards",hazardPh:"e.g. gas leak",note:"Notes",notePh:"Victim location, access route, etc.",startT:"Search start",endT:"Search end",now:"Now",
 newPin:"New pin",editPin:"Edit pin",created:"Created",updated:"Last updated",unsent:"Unsent",
 dupWarn:"There are pins within 30 m. Make sure this building isn't being searched twice",
 nameReq:"Enter a building name",saved:"Saved",saveFail:"Couldn't save",deleted:"Deleted",delFail:"Couldn't delete",
 delForbidden:"You can't delete another team's pin",delOffline:"Can't delete while offline",queued:"Offline: will be sent automatically when back online",sent:"Unsent data was sent",
 gpsFallback:"No GPS: placed at map centre",gpsFail:"Couldn't get GPS",loadFail:"Couldn't load pins",sessionExpired:"Session expired. Please log in again",
 teamReq:"Enter a team name",idRule:"ID: 3–20 letters, digits, _ or -",pwRule:"Password: at least 6 characters",idTaken:"That ID is already taken",badCred:"Wrong ID or password",
 missingIn:"Some fields are missing",noServer:"Can't reach the server. Check your connection",serverErr:"Server error ({code})",none:"None",unnamed:"(unnamed)",
 synced:"Synced {time}",offline:"Offline",pending:"{n} unsent",allTeams:"All teams",myTeam:"My team",filterLabel:"Team filter",
 addrSearchPh:"Address or place",search:"Search",searching:"Searching…",noResult:"No results",geoFail:"Address search failed",
 otherUpdated:"Someone else updated this pin. Saving will overwrite their changes",qrFail:"Couldn't load the QR code (check your connection)",
 layerLabel:"Map type",layerOsm:"OSM",layerStd:"GSI map",layerPale:"GSI pale",layerPhoto:"Aerial photo",
 unsavedTitle:"Unsaved changes",unsavedClose:"If you close now, your changes will be lost.",unsavedMove:"If you move to another pin now, your changes will be lost.",
 keepEditing:"Keep editing",discardClose:"Discard & close",discardMove:"Discard & move",showAll:"Show all",filterOnly:"Show only {s}",
 shareOn:"Share location: ON",shareOff:"Share location: OFF",teamsOn:"Teams: shown",teamsOff:"Teams: hidden",
 nearTeams:"Nearest teams (to send as backup)",nearNone:"No team is sharing its location",justNow:"just now",agoMin:"{n} min ago",agoHour:"{n} h ago",
 roleLegend:"Account type",roleMember:"Sign up as a field member",roleHq:"Sign up as HQ",hqCode:"HQ passcode",hqCodeReq:"Enter the HQ passcode",badHqCode:"Wrong HQ passcode",hqDisabled:"HQ sign-up is not enabled on this server",hqTag:"HQ",
 detailBtn:"Full details",qSt0:"□\nNot searched",qSt1:"◪\nSearching",qSt2:"■\nSearched",
 floorsT:"Floors",floorsHint:"Record status per floor and per shop.",floorsNone:"No floors",floorsInput:"Enter floors",above:"Above ground",below:"Basement",floorUnit:"F",makeTabs:"Create {n} floor tabs",makeNone:"Enter the number of floors",
 floorsOffTitle:"Remove floors?",floorsOffMsg:"The floors and everything entered per floor will be deleted.",floorsOffOk:"Delete & use no floors",floorsHqOnly:"Only HQ can remove saved floors",
 doneOf:"Searched {n} / {m} floors",floorLabelPh:"e.g. Mezzanine, Roof",addFloorOk:"+ Add floor",floorDup:"A floor with that name exists",floorDel:"Delete this floor",
 shopsT:"Shops / areas",shopsIn:"(on this floor)",addShop:"+ Add shop / area",shopName:"Shop / area name",shopNamePh:"Shop A",shopDel:"Delete this shop / area",shopNameReq:"Enter a shop / area name",
 floorNote:"Notes (this floor)",bldNote:"Notes (building)",totals:"Counts (total of shops / areas)",autoTag:"AUTO",
 autoRule:"・Searching if any is searching|・Not searched only if all are not searched|・Searched only if all are searched|・A mix of not searched and searched counts as searching",
 shopOnlyHint:"Entry, hazards, start/end times and counts are entered inside each shop / area.",
 delTitle:"Delete?",delFloorMsg:"This floor and its shops / areas will be deleted.",delShopMsg:"This shop / area will be deleted.",delOk:"Delete",
 victims:"Victims (V)",vAdd:"+ Add V",vNone:"None yet",vSaveFirst:"Save the pin first to add victims (V) and photos",
 vNew:"Add victim",vEdit:"Victim (V)",vs0:"V possible",vs1:"L alive",vs2:"D dead",vs3:"Rescued",
 vPlace:"Location",vAtPin:"Building",vAtGps:"My location",vAtMap:"Pick on map",vTapMap:"Tap the victim's location",
 vNotePh:"e.g. NE room, responds to calls",offlineNoSave:"Can't save while offline",delOther:"You can't delete another team's entry",cancel:"Cancel",
 photos:"Photos",phAdd:"+ Photo",phNone:"No photos",phUploading:"Uploading…",phFail:"Couldn't upload the photo",phTooBig:"Photo is too large",phLoadFail:"Couldn't load photo",
 offlineSince:"Offline (last sync {time})",
 navModeOn:"Roads: ON",navModeOff:"Roads: OFF",routeInfo:"By road · ~{min} min walk",routeLoading:"Getting the route…",routeOffline:"No connection: straight line (switches to roads when online)",
 routeNone:"No route found (straight line)",routeFar:"Too far for a walking route (straight line)",routeFail:"Couldn't get the route (straight line)",routeOff:"Off the route",routeRe:"Recalculating the route…",
 navNext:"In {d}, {turn}",navNow:"Now {turn}",navAlong:"Continue along the route",navOnto:" onto {name}",
 turnL:"turn left",turnR:"turn right",turnSL:"bear left",turnSR:"bear right",turnHL:"sharp left",turnHR:"sharp right",turnU:"turn back",turnRb:"enter the roundabout",
 routeAttr:'Route: <a href="https://routing.openstreetmap.de/about.html" target="_blank" rel="noopener">FOSSGIS/OSRM</a> (<a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noopener">report a map error</a>)',
 navGo:"Navigate here",navTo:"To: {name}",navDir:"Towards {dir} · ~{min} min walk (straight line)",navAcc:"GPS ±{m} m",navStale:"no GPS update for {s}s",
 navPoint:"Point on map",ptTitle:"Selected point",navShort:"Go",teamPosH:"Team position",navTeam:"Navigate to this team",fromHere:"{d} from you",navTeamAge:"Their position: {age}",
 hintLongPress:"Tip: long-press the map (right-click on a PC) to navigate to that point",
 navNorthUp:"Arrow: map up = north",navCompassOn:"Arrow follows the phone",navMoveDir:"Arrow: direction of travel",navWaiting:"Getting your location…",navGpsDenied:"Location permission is not allowed",
 navArrived:"You have arrived",navEnd:"End",navFit:"Overview",navRoute:"Maps app",navCompass:"Compass",navCompassNo:"Compass unavailable (showing map-up = north)",
 dirs:"N,NE,E,SE,S,SW,W,NW",
 offBtn:"Save",offBtnAria:"Save map for offline use",offTitle:"Save map for offline use",
 offHelp:"Saves the map of the area currently on screen to this device, so it shows even without signal. Only GSI maps can be saved (OpenStreetMap forbids bulk downloading). Before entering the site, show your assigned area and save it.",
 offLayer:"Map to save",offEstimate:"About {n} tiles · ~{mb} MB (zoom {z1}–{z2})",offLimited:"The area is large, so only up to zoom {z}. Narrow the area to save more detail.",
 offTooBig:"The area is too large. Zoom in a little before saving.",offStart:"Start",offCancel:"Stop",offProgress:"Saving… {done} / {n}",
 offDone:"Saved ({n} tiles).",offFailN:"{n} tiles could not be saved.",offSwitched:"Switched the map to \"{layer}\".",offCancelled:"Stopped ({n} tiles saved)",
 offSavedH:"Saved maps",offSavedN:"{a} areas · {n} tiles",offNone:"Nothing saved yet",offClear:"Delete saved maps",offNeedNet:"An internet connection is needed to save",
 inviteCode:"Invite code (from HQ)",inviteReq:"Enter the invite code",badInvite:"The invite code is wrong or no longer valid",
 hqTeamName:"HQ name",hqTeamPh:"HQ",hqDefaultName:"HQ",adminBtn:"Teams",admTitle:"Team management (HQ)",newTeamPh:"New team name (e.g. Team C)",create:"Create",
 teamExists:"A team with this name already exists",teamNameReq:"Enter a team name",membersN:"{n} members",noMembers:"No members yet",
 copyInvite:"Copy invite",regen:"New code",regenConfirm:"Press again to confirm (the current code will stop working)",tmDisable:"Disable",tmEnable:"Enable",tmDisabled:"Disabled",
 rmMember:"Remove",rmConfirm:"Press again to remove",hqAccounts:"HQ accounts",inviteMsg:"[Search Status Share] Invitation to {team}\n{url}\nInvite code: {code}",
 copiedInvite:"Invite copied. Send it to the team members (e.g. via LINE)",admFail:"Action failed",regenDone:"New code issued",teamCreated:"Created",
 tmNoTeams:"No teams yet. Create one above",admHelp:"Creating a team issues an invite code. Members sign up with that code (people without it cannot sign up).",
 facLabel:"Facilities to check",facAll:"Facilities: all",facSchool:"Facilities: schools",facFactory:"Facilities: factories",facPower:"Facilities: power",facMall:"Facilities: malls",facOff:"Facilities: hidden",
 k_hospital:"Hospital",facHospital:"Facilities: hospitals",facBeds:"{n} beds",facEmg:"Emergency dept.",
 k_school:"School",k_factory:"Factory",k_power:"Power plant / substation",k_mall:"Large commercial facility",facZoom:"Zoom in to see facilities",facPin:"Place a pin here",facNoName:"(no name)",facAttr:"Facility data",
 s_hospital:"Hospital",s_school:"School",s_kindergarten:"Kindergarten",s_university:"University",s_college:"College",s_plant:"Power plant",s_substation:"Substation",
 s_mall:"Shopping mall",s_department_store:"Department store",s_retail:"Retail building",s_works:"Factory",s_industrial:"Industrial area",s_factory:"Factory",dec10:"Decrease by 10",totalPeople:"People in building (total)",personsN:"{n}",
 floorPhotos:"Photos of this floor",floorPhSave:"Save the pin first to add floor photos",
 lang:"日本語",locale:"en-GB"}};
var lang=S.get("ss_lang")==="en"?"en":"ja";
function t(k,o){var s=I18N[lang][k];if(s==null)s=I18N.ja[k]!=null?I18N.ja[k]:k;
  return o?s.replace(/\{(\w+)\}/g,function(_,n){return o[n]}):s}
function fmtTime(ms){if(!ms)return"";try{return new Date(ms).toLocaleString(t("locale"),{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"})}catch(e){return new Date(ms).toLocaleString()}}
function applyI18n(){
  document.documentElement.lang=lang;document.title=t("title");
  $$("[data-i18n]").forEach(function(el){el.textContent=t(el.getAttribute("data-i18n"))});
  $$("[data-i18n-aria]").forEach(function(el){el.setAttribute("aria-label",t(el.getAttribute("data-i18n-aria")))});
  $$(".lg").forEach(function(el){el.textContent=t("lang")});
  setMode(mode);renderToggles();renderLayerSelect();
  if(user){$("who").textContent=whoText();render();renderNet();renderTeams();renderFac();if(nav){drawRoute();buildNavBar();updNav()}if(draft){collectForm();openSheet(draft,true)}if($("srch"))openSearch()}
}
$$(".lg").forEach(function(el){el.onclick=function(){lang=lang==="ja"?"en":"ja";S.set("ss_lang",lang);applyI18n()}});

/* ---------- API ---------- */
function api(method,url,body){
  var h={"Content-Type":"application/json"};
  if(user&&user.token)h.Authorization="Bearer "+user.token;
  return fetch(url,{method:method,headers:h,body:body?JSON.stringify(body):undefined})
    .then(function(r){return r.json()["catch"](function(){return{}}).then(function(j){j._status=r.status;if(!r.ok)return Promise.reject(j);return j})},
      function(){return Promise.reject({_net:true})});
}

/* ---------- auth ---------- */
var mode="login";
var ERR_MSG={bad_invite:"badInvite",invite_required:"inviteReq",team_exists:"teamExists",id_taken:"idTaken",invalid_id:"idRule",weak_password:"pwRule",invalid_credentials:"badCred",missing:"missingIn",bad_hq_code:"badHqCode",hq_disabled:"hqDisabled"};
function setMode(m){mode=m;$("tLogin").classList.toggle("on",m==="login");$("tReg").classList.toggle("on",m==="reg");
  $("fRole").classList.toggle("hide",m!=="reg");updRegFields();$("go").textContent=m==="login"?t("login"):t("startReg");
  $("pw").autocomplete=m==="login"?"current-password":"new-password";$("err").textContent=""}
$("tLogin").onclick=function(){setMode("login")};$("tReg").onclick=function(){setMode("reg")};
function curRole(){var r=document.querySelector('input[name="role"]:checked');return r?r.value:"member"}
// 隊員：招待コードだけ（隊は招待コードで決まる） / 本部：本部の名前＋合言葉
function updRegFields(){
  var reg=mode==="reg",hq=curRole()==="hq";
  $("fInvite").classList.toggle("hide",!reg||hq);$("fTeam").classList.toggle("hide",!reg||!hq);$("fHq").classList.toggle("hide",!reg||!hq);
  $("team").placeholder=t("hqTeamPh");
}
$$('input[name="role"]').forEach(function(r){r.onchange=updRegFields});
function submit(){
  var id=$("uid").value.trim(),pw=$("pw").value,team=$("team").value.trim();
  if(mode==="reg"){
    var role=curRole(),hq=$("hqc").value,inv=$("inv").value.trim();
    if(role!=="hq"&&!inv)return fail(t("inviteReq"));
    if(!/^[A-Za-z0-9_-]{3,20}$/.test(id))return fail(t("idRule"));
    if(pw.length<6)return fail(t("pwRule"));
    if(role==="hq"&&!hq)return fail(t("hqCodeReq"));
    $("go").disabled=true;
    var body=role==="hq"?{id:id,password:pw,role:"hq",team:team||t("hqDefaultName"),hqCode:hq}:{id:id,password:pw,role:"member",code:inv};
    api("POST","/api/register",body).then(enter,authErr)["finally"](function(){$("go").disabled=false});
  }else{
    $("go").disabled=true;
    api("POST","/api/login",{id:id,password:pw}).then(enter,authErr)["finally"](function(){$("go").disabled=false});
  }
}
function authErr(e){fail(e&&ERR_MSG[e.error]?t(ERR_MSG[e.error]):e&&e._net?t("noServer"):t("serverErr",{code:(e&&(e.error||e._status))||"?"}))}
function fail(m){$("err").textContent=m}
$("go").onclick=submit;
["uid","pw","team","inv","hqc"].forEach(function(i){$(i).addEventListener("keydown",function(e){if(e.key==="Enter")submit()})});

/* ---------- state ---------- */
var user=null,pins=[],gps=null,placing=false,draft=null;
var c={lat:35.6812,lng:139.7671};
var online=true,lastSync=0,pollTimer=null,teamFilter=S.get("ss_teamf")||"all";
var teamPos=[],posSkew=0;                       // 各隊の位置 / サーバー時刻との差
var shareLoc=S.get("ss_share")!==false,showTeams=S.get("ss_showteams")!==false;
var watchId=null,lastSent=0,lastSentPos=null;
var POLL_MS=10000,DUP_M=30;
var fo={},so={},hadFloors=false; // 階・店舗の開閉 / 保存済みの階があるか
var victims=[],vplacing=null,photoURLs={};    // 要救助者（V） / 地図で位置を指定中のV / 写真のキャッシュ
var stFilter=[],base=null; // stFilter: 地図に表示する状況（空＝すべて） / base: 編集開始時の入力内容

function isHq(){return !!user&&user.role==="hq"}
function isHQ(){return !!user&&user.role==="hq"}
function whoText(){return user.team+" / "+user.id+(user.role==="hq"?" ["+t("hqTag")+"]":"")}
function enter(u){
  user={id:u.id,team:u.team,token:u.token,role:u.role||"member"};S.set("ss_session",user);
  $("auth").classList.add("hide");$("app").classList.remove("hide");
  $("who").textContent=whoText();
  $("admBtn").classList.toggle("hide",!isHQ());
  // 前回の同期データを先に表示（オフラインで開いた場合もピンが見える）
  var cc=S.get(cKey());
  if(cc){pins=withQueue(cc.pins||[]);victims=cc.victims||[];lastSync=cc.t||0}
  setTimeout(function(){map.invalidateSize();fitWorldZoom();render();renderNet();locate(true)},0);
  startShare();
  setTimeout(loadFacilities,0);
  setTimeout(resumeNav,0);   // ナビ中にアプリが閉じた・再読み込みした場合は続きから
  if(!S.get("ss_hint_lp")){S.set("ss_hint_lp",1);setTimeout(function(){if(user)toast(t("hintLongPress"),7000)},3000)}   // 長押しナビのヒント（端末ごとに1回）
  api("GET","/api/me").then(function(m){ // 古いセッションでも、種類（隊員/本部）を最新にする
    if(user&&m&&m.role&&m.role!==user.role){user.role=m.role;S.set("ss_session",user);$("who").textContent=whoText()}
  },function(){});
  sync();
  clearInterval(pollTimer);pollTimer=setInterval(function(){if(!document.hidden)sync()},POLL_MS);
}
function logout(){
  stopNav();stopWatch();teamPos=[];renderTeams();
  if(user&&user.token){ // 先に自分の位置を消してから、ログアウトする
    var tk={Authorization:"Bearer "+user.token};
    fetch("/api/position",{method:"DELETE",headers:tk}).then(function(){return fetch("/api/logout",{method:"POST",headers:tk})})["catch"](function(){});
  }
  clearInterval(pollTimer);S.set("ss_session",null);user=null;pins=[];victims=[];vplacing=null;closeVictim();closePhoto();closeSheet();closeSearch();closeAdmin();renderVictims();renderFac();$("admBtn").classList.add("hide");
  $("app").classList.add("hide");$("auth").classList.remove("hide");$("pw").value="";$("hqc").value=""}
$("out").onclick=function(){if($("sheet")&&isDirty())confirmDiscard("close",logout);else logout()};
document.addEventListener("visibilitychange",function(){
  if(!document.hidden&&user){sync();if(shareLoc){startShare();getPos().then(function(p){lastSent=0;sendPos(p)},function(){})}}
});
window.addEventListener("online",function(){if(user)sync()});
window.addEventListener("offline",function(){online=false;renderNet()});

/* ---------- 同期（10秒ごとの自動更新 + オフライン時の未送信キュー） ---------- */
function qKey(){return "ss_queue_"+(user?user.id:"")}
function cKey(){return "ss_cache_"+(user?user.id:"")}
function queue(){return S.get(qKey())||[]}
function setQueue(q){S.set(qKey(),q)}
/* ---------- 階・店舗・区画（状況の決め方はサーバーと同じ） ---------- */
function statusRule(a){
  if(!a.length)return null;
  if(a.some(function(x){return x===1}))return 1;
  if(a.every(function(x){return x===0}))return 0;
  if(a.every(function(x){return x===2}))return 2;
  return 1;
}
function sumK(list,k){return Math.min(list.reduce(function(a,x){return a+(+x[k]||0)},0),100000)}
function hasFloors(d){return !!(d&&d.floors&&d.floors.length)}
function floorView(f){
  var sh=f.shops||[];
  if(!sh.length)return{status:+f.status||0,live:+f.live||0,dead:+f.dead||0,missing:+f.missing||0,auto:false};
  return{status:statusRule(sh.map(function(x){return +x.status||0})),live:sumK(sh,"live"),dead:sumK(sh,"dead"),missing:sumK(sh,"missing"),auto:true};
}
function applyDerived(d){
  if(!hasFloors(d))return d;
  var vs=d.floors.map(floorView),ents=[];
  d.floors.forEach(function(f){(f.shops&&f.shops.length?f.shops:[f]).forEach(function(e){ents.push(e)})});
  var st=ents.map(function(e){return e.startAt}).filter(Boolean);
  d.status=statusRule(vs.map(function(v){return v.status}));
  d.live=sumK(vs,"live");d.dead=sumK(vs,"dead");d.missing=sumK(vs,"missing");
  d.hazard=ents.map(function(e){return(e.hazard||"").trim()}).filter(function(h,i,a){return h&&a.indexOf(h)===i}).join("／").slice(0,200);
  d.go=ents.every(function(e){return e.go!==false});
  d.startAt=st.length?Math.min.apply(null,st):null;
  d.endAt=ents.every(function(e){return e.endAt})?Math.max.apply(null,ents.map(function(e){return e.endAt})):null;
  return d;
}
// 建物の人数（合計）：階・店舗があればその合計、なければ建物全体の入力値
function peopleOf(d){
  if(hasFloors(d)){var vs=d.floors.map(floorView);return{missing:sumK(vs,"missing"),live:sumK(vs,"live"),dead:sumK(vs,"dead")}}
  return{missing:+d.missing||0,live:+d.live||0,dead:+d.dead||0};
}
function updateTotal(){
  var el=$("ptot");if(!el||!draft)return;
  var v=peopleOf(draft),n=v.missing+v.live+v.dead;
  el.querySelector("b").textContent=t("personsN",{n:n});
  el.querySelector("small").textContent="M"+v.missing+" L"+v.live+" D"+v.dead;
}
function floorsProgress(p){
  if(!hasFloors(p))return"";
  return p.floors.filter(function(f){return floorView(f).status===2}).length+"/"+p.floors.length;
}
function floorsForSend(fl){
  var one=function(e){return{status:+e.status||0,go:e.go!==false,live:+e.live||0,dead:+e.dead||0,missing:+e.missing||0,
    hazard:(e.hazard||"").trim(),note:(e.note||"").trim(),startAt:e.startAt||null,endAt:e.endAt||null}};
  return fl.map(function(f){var o=one(f);o.label=(f.label||"").trim();
    o.shops=(f.shops||[]).map(function(s){var x=one(s);x.id=s.id;x.name=(s.name||"").trim();return x});return o});
}
function pinBody(d){return{lat:d.lat,lng:d.lng,name:d.name,status:d.status,go:d.go,live:d.live,dead:d.dead,missing:d.missing,
  hazard:d.hazard||"",address:d.address||"",floor:d.floor||"",note:d.note||"",startAt:d.startAt||null,endAt:d.endAt||null,
  floors:hasFloors(d)?floorsForSend(d.floors):null}}
function isTmp(id){return typeof id==="string"&&id.indexOf("tmp-")===0}
function enqueue(d){
  var q=queue(),body=pinBody(d),i;
  if(!d.id||isTmp(d.id)){
    if(!d.id)d.id="tmp-"+Date.now();
    for(i=0;i<q.length;i++)if(q[i].tmp===d.id){q[i].body=body;break}
    if(i===q.length)q.push({op:"create",tmp:d.id,body:body});
  }else{
    for(i=0;i<q.length;i++)if(q[i].op==="update"&&q[i].id===d.id){q[i].body=body;break}
    if(i===q.length)q.push({op:"update",id:d.id,body:body});
  }
  setQueue(q);
}
function withQueue(list){
  var q=queue(),byId={};
  list.forEach(function(p){byId[p.id]=p});
  q.forEach(function(e){
    if(e.op==="update"&&byId[e.id]){var p=byId[e.id];for(var k in e.body)p[k]=e.body[k];p._pending=true}
    if(e.op==="create"){var n=JSON.parse(JSON.stringify(e.body));n.id=e.tmp;n.team=user.team;n.by=user.id;n._pending=true;list.push(n)}
  });
  return list;
}
var flushing=null;
function flush(){
  if(flushing)return flushing;
  var q=queue();if(!q.length||!user)return Promise.resolve(false);
  var sentAny=false;
  flushing=q.reduce(function(prev,e){
    return prev.then(function(stop){
      if(stop)return true;
      var req=e.op==="create"?api("POST","/api/pins",e.body):api("PUT","/api/pins/"+e.id,e.body);
      return req.then(function(){drop(e);sentAny=true;return false},function(err){
        if(err&&err._net)return true;               // まだオフライン → 次回再送
        if(err&&err._status===401)return true;
        drop(e);return false;                        // 400/404等は再送しても無駄なので破棄
      });
    });
  },Promise.resolve(false)).then(function(){flushing=null;if(sentAny)toast(t("sent"));return sentAny});
  function drop(e){setQueue(queue().filter(function(x){return !(x.op===e.op&&(x.tmp||x.id)===(e.tmp||e.id))}))}
  return flushing;
}
function sync(){
  if(!user)return;
  flush().then(function(){
    return api("GET","/api/pins").then(function(list){
      online=true;lastSync=Date.now();
      if(draft&&typeof draft.id==="number"&&!draft._warned){
        var cur=list.filter(function(p){return p.id===draft.id})[0];
        if(cur&&cur.t>draft.t&&cur.updatedBy!==user.id){draft._warned=true;toast(t("otherUpdated"),4000)}
      }
      var raw=JSON.parse(JSON.stringify(list));
      pins=withQueue(list);render();renderNet();fetchPositions();
      api("GET","/api/victims").then(function(vl){
        victims=vl;renderVictims();renderVictimList();
        S.set(cKey(),{pins:raw,victims:vl,t:lastSync});
      },function(){S.set(cKey(),{pins:raw,victims:victims,t:lastSync})});
    },function(e){
      if(e&&e._status===401){toast(t("sessionExpired"));logout();return}
      if(e&&e._net){online=false;pins=withQueue(pins.filter(function(p){return !p._pending||!isTmp(p.id)}));render();renderNet();return}
      toast(t("loadFail"));
    });
  });
}
function renderNet(){
  var n=queue().length,el=$("net");
  el.classList.toggle("off",!online);
  var ls=lastSync?new Date(lastSync).toLocaleTimeString(t("locale"),{hour:"2-digit",minute:"2-digit",second:"2-digit"}):"";
  el.innerHTML='<i></i><span>'+esc(online?t("synced",{time:ls||"--"}):ls?t("offlineSince",{time:ls}):t("offline"))+'</span>'+
    (n?' <b>'+esc(t("pending",{n:n}))+'</b>':'');
}

/* ---------- geo ---------- */
function getPos(){return new Promise(function(res,rej){
  if(!navigator.geolocation)return rej();
  navigator.geolocation.getCurrentPosition(function(p){res({lat:p.coords.latitude,lng:p.coords.longitude})},rej,{enableHighAccuracy:true,timeout:8000,maximumAge:5000})})}
function locate(center){
  getPos().then(function(p){
    gps=p;showGps(p);
    if(center)map.setView([p.lat,p.lng],Math.max(map.getZoom(),17));
  },function(){gps=null;if(!center)toast(t("gpsFail"))});
}
function distM(a,b){
  var R=6371000,r=Math.PI/180,dLat=(b.lat-a.lat)*r,dLng=(b.lng-a.lng)*r;
  var h=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLng/2)*Math.sin(dLng/2);
  return 2*R*Math.asin(Math.sqrt(h));
}

/* ---------- map（Leaflet + OpenStreetMap） ---------- */
var ST_FULL_ZOOM=18; // これ以上のズームで建物単位の詳細表示、未満は色点のみ
var WORLD_LAT=85.0511;   // メルカトル図法の地図の上端・下端の緯度
var map=L.map("map",{zoomControl:false,attributionControl:true,maxZoom:19,tapHold:true,   // tapHold：iPhoneでも長押しを使えるように
  maxBounds:[[-WORLD_LAT,-1e6],[WORLD_LAT,1e6]],maxBoundsViscosity:1   // 上下は世界の端で止める。横（経度）は止めない＝地球儀のように回せる
}).setView([c.lat,c.lng],17);
// 背景地図：OpenStreetMap ／ 国土地理院（地理院タイル：無料・登録不要、出典表示が必要）
var GSI_ATTR='<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">国土地理院</a>';
var LAYERS={
  osm:L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'}),
  std:L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",{maxZoom:19,minNativeZoom:2,maxNativeZoom:18,attribution:GSI_ATTR}),
  pale:L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",{maxZoom:19,minNativeZoom:2,maxNativeZoom:18,attribution:GSI_ATTR}),
  photo:L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",{maxZoom:19,minNativeZoom:2,maxNativeZoom:18,attribution:GSI_ATTR})
};
var LAYER_KEYS={osm:"layerOsm",std:"layerStd",pale:"layerPale",photo:"layerPhoto"};
var baseKey=LAYERS[S.get("ss_layer")]?S.get("ss_layer"):"osm";
function setBase(k){
  if(!LAYERS[k])k="osm";
  Object.keys(LAYERS).forEach(function(x){if(x!==k&&map.hasLayer(LAYERS[x]))map.removeLayer(LAYERS[x])});
  if(!map.hasLayer(LAYERS[k]))LAYERS[k].addTo(map);
  baseKey=k;S.set("ss_layer",k);
  $("map").classList.toggle("photo",k==="photo"); // 航空写真は夜テーマでも色を反転しない
}
function renderLayerSelect(){
  $("ml").innerHTML=Object.keys(LAYERS).map(function(k){return '<option value="'+k+'"'+(k===baseKey?" selected":"")+'>'+esc(t(LAYER_KEYS[k]))+'</option>'}).join("");
}
$("ml").onchange=function(){setBase(this.value)};
setBase(baseKey);
L.control.scale({metric:true,imperial:false,position:"bottomleft"}).addTo(map);

/* ---------- 世界地図は1つだけ表示（v2.9.1） ----------
 * Leaflet は縮小すると世界地図を横に何枚も並べて表示する。
 *  - 縮小の限界を「世界地図の幅・高さが画面の大きい方の辺と同じ」にする → 同じ場所が2回見えることはない
 *  - 横には止めずに回せる（右に回し続けると、また同じ場所に戻ってくる＝地球儀と同じ）
 *  - ピンなどの印は世界1つ分にしか描かれないので、回し終わったら、印のある「1つ分」に地図を戻す（見た目は変わらない）
 */
function fitWorldZoom(){
  var s=map.getSize();if(!s.x||!s.y)return;   // ログイン前（地図が非表示）は何もしない
  var z=Math.log(Math.max(s.x,s.y)/256)/Math.LN2;   // 世界地図（256px×2^z）が画面の大きい方の辺とぴったり同じになるズーム
  z=Math.max(1,Math.round(z*1000)/1000);
  if(Math.abs(z-map.getMinZoom())>.001)map.setMinZoom(z);   // 今それより縮小していたら、自動でこのズームになる
}
map.on("resize",fitWorldZoom);fitWorldZoom();
// 世界全体を見ているとき：ピンのある地域を中心とした「世界1つ分」に収める（日本のピンなら、日本が見えているときは必ずピンも見える）
// 拡大しているとき：経度 −180〜180° に収める（その場所の印がそのまま見える）
function homeLng(){
  var x=0,y=0;
  pins.forEach(function(p){var a=p.lng*Math.PI/180;x+=Math.cos(a);y+=Math.sin(a)});
  if(x||y)return Math.atan2(y,x)*180/Math.PI;
  return gps?gps.lng:137;   // ピンがまだないとき：現在地、それもなければ日本の中央
}
var wrapT=null;
function wrapView(){
  wrapT=null;
  var c=map.getCenter(),ref=map.getZoom()<=5?homeLng():0,k=Math.round((c.lng-ref)/360);
  if(k)map.setView([c.lat,c.lng-360*k],map.getZoom(),{animate:false});   // 世界1つ分ずらすだけなので、見た目は同じ
}
// 動きが完全に止まってから戻す（慣性で動いている途中・他の自動の動きの途中には触らない）
map.on("moveend",function(){clearTimeout(wrapT);wrapT=setTimeout(wrapView,80)});
map.on("movestart",function(){clearTimeout(wrapT);wrapT=null});
function wrapLL(ll){ll=L.latLng(ll).wrap();return{lat:ll.lat,lng:ll.lng}}   // 地図を回した先で押した位置も、経度 −180〜180° に直す
var markersLayer=L.layerGroup().addTo(map);
var gpsMarker=null;

function glyph(st,r,col){
  col=col||"var(--ink)";
  var p="0,"+-r+" "+r+",0 0,"+r+" "+-r+",0",q=(r*.5);
  var out='<polygon points="'+p+'" fill="'+(st===2?col:"var(--bg)")+'" stroke="'+col+'" stroke-width="1.6"/>';
  if(st===1)out+='<polygon points="0,'+-q+' '+q+',0 0,'+q+' '+-q+',0" fill="'+col+'"/>';
  return out;
}
function pinSVG(p,detailed){
  var st=+p.status,col="var(--st"+(st>=0&&st<=2?st:1)+")",dash=p._pending?' stroke-dasharray="4 3"':'',red=st===0;
  if(!detailed){
    var ring=p._pending?"var(--warn)":"var(--bg)";
    if(red)return '<svg width="30" height="30" viewBox="-15 -15 30 30" style="overflow:visible"><circle class="pulse" r="9" fill="none" stroke="var(--st0)" stroke-width="2.5"/><circle r="12.5" fill="none" stroke="var(--st0)" stroke-width="2" opacity=".55"/><circle r="9" fill="'+col+'" stroke="'+ring+'" stroke-width="2"'+dash+'/></svg>';
    return '<svg width="20" height="20" viewBox="-10 -10 20 20"><circle r="7" fill="'+col+'" stroke="'+ring+'" stroke-width="2"'+dash+'/></svg>';
  }
  var q=18,tx=function(x,y,z,v,al){return '<text x="'+x+'" y="'+y+'" text-anchor="'+(al||"middle")+'" font-size="'+z+'">'+esc(v)+'</text>'};
  var halo=red?'<rect class="pulse" x="-18" y="-18" width="36" height="36" fill="none" stroke="var(--st0)" stroke-width="3"/><rect x="-24" y="-24" width="48" height="48" fill="none" stroke="var(--st0)" stroke-width="2" opacity=".6"/>':'';
  return '<svg width="76" height="100" viewBox="-38 -38 76 100" style="overflow:visible">'+halo+
    '<rect x="'+-q+'" y="'+-q+'" width="'+2*q+'" height="'+2*q+'" fill="var(--panel)" stroke="'+col+'" stroke-width="'+(red?5:4)+'"'+dash+'/>'+
    tx(0,-5,10,(p.team||"").slice(0,3))+'<g transform="translate(0,8)">'+glyph(st,6,col)+'</g>'+
    tx(0,-25,11,(p.hazard||"").slice(0,6))+tx(-23,5,13,"L"+(p.live||0),"end")+tx(23,5,13,"D"+(p.dead||0),"start")+tx(0,36,13,"M"+(p.missing||0))+
    tx(0,53,12,(p.name||"")+(p.floor?" "+p.floor:"")+(floorsProgress(p)?" "+floorsProgress(p):""))+'</svg>';
}
function pinIcon(p,detailed){
  var red=+p.status===0,sz=detailed?[76,100]:(red?[30,30]:[20,20]),an=detailed?[38,38]:(red?[15,15]:[10,10]);
  return L.divIcon({html:pinSVG(p,detailed),className:"pin-ic",iconSize:sz,iconAnchor:an});
}
function visible(){
  if(teamFilter==="all")return pins;
  var tm=teamFilter==="mine"?(user&&user.team):teamFilter.slice(5);
  return pins.filter(function(p){return p.team===tm});
}
function onMap(){
  var l=visible();
  return stFilter.length?l.filter(function(p){return stFilter.indexOf(+p.status)>=0}):l;
}
function renderFilter(){
  var teams={};pins.forEach(function(p){if(p.team)teams[p.team]=1});
  var opts=[["all",t("allTeams")],["mine",t("myTeam")]].concat(Object.keys(teams).sort().map(function(x){return["team:"+x,x]}));
  if(!opts.some(function(o){return o[0]===teamFilter}))opts.push([teamFilter,teamFilter.slice(5)]);
  $("tf").innerHTML=opts.map(function(o){return '<option value="'+esc(o[0])+'"'+(o[0]===teamFilter?" selected":"")+'>'+esc(o[1])+'</option>'}).join("");
}
$("tf").onchange=function(){teamFilter=this.value;S.set("ss_teamf",teamFilter);closeListPanel();render()};
function render(){
  if(!user)return;
  var detailed=map.getZoom()>=ST_FULL_ZOOM,list=visible(),shown=onMap();
  markersLayer.clearLayers();
  var reds=0;
  shown.forEach(function(p){
    var red=+p.status===0;if(red)reds++;
    var m=L.marker([p.lat,p.lng],{icon:pinIcon(p,detailed),zIndexOffset:red?1000:0});
    m.on("click",function(e){if(vplacing){placeVictimAt(e.latlng);return}openPinEdit(p,false)});
    markersLayer.addLayer(m);
  });
  $("map").classList.toggle("nopulse",reds>40);
  renderVictims();
  if(draft&&!draft.id){
    markersLayer.addLayer(L.marker([draft.lat,draft.lng],{
      interactive:false,
      icon:L.divIcon({html:'<div style="width:36px;height:36px;border:2.5px dashed var(--mark);box-sizing:border-box;border-radius:2px"></div>',className:"pin-ic",iconSize:[36,36],iconAnchor:[18,18]})
    }));
  }
  var n=[0,0,0];list.forEach(function(p){n[+p.status]=(n[+p.status]||0)+1});
  var fl=stFilter.length>0;
  $("cnt").classList.toggle("filtering",fl);
  $("cnt").innerHTML=[0,1,2].map(function(i){
    var on=stFilter.indexOf(i)>=0;
    return '<div class="cs'+(on?' sel':'')+'"><button type="button" class="fbtn'+(on?' on':'')+'" data-f="'+i+'" aria-pressed="'+on+'" aria-label="'+esc(t("filterOnly",{s:t("st"+i)}))+'"><svg width="16" height="16" viewBox="-8 -8 16 16">'+glyph(i,7,"var(--st"+i+")")+'</svg></button>'+
      '<button type="button" class="clab" data-status="'+i+'">'+esc(t("st"+i))+' <b class="mono">'+n[i]+'</b></button></div>';
  }).join("")+(fl?'<button type="button" class="fall" id="fall">'+esc(t("showAll"))+'</button>':'');
  renderFilter();
}
window.addEventListener("resize",function(){map.invalidateSize();layoutPanels()});
map.on("zoomend",render);
map.on("click",function(e){
  if(vplacing){placeVictimAt(e.latlng);return}
  if($("sheet")){requestClose();return}
  if($("srch")){closeSearch();return}
  if(placing){setPlacing(false);openSheet(blank(wrapLL(e.latlng)))}
});
$("zi").onclick=function(){map.setZoom(Math.floor(map.getZoom()+1e-6)+1)};
$("zo").onclick=function(){map.setZoom(Math.ceil(map.getZoom()-1e-6)-1)};
$("zc").onclick=function(){locate(true);enableCompass()};   // 現在地へ移動＋向き（コンパス）を表示

/* ---------- 各隊の位置（本部が地図で確認 / 位置の古さを表示） ---------- */
var AGE_STALE=2*60*1000,AGE_OLD=10*60*1000; // 2分以内=新しい / 10分以上=古い（画面を閉じている可能性）
var teamLayer=L.layerGroup().addTo(map);
function nowS(){return Date.now()+posSkew}
function ageLevel(a){return a<AGE_STALE?0:a<AGE_OLD?1:2}
function fmtAge(a){
  if(a<60000)return t("justNow");
  var m=Math.floor(a/60000);
  return m<60?t("agoMin",{n:m}):t("agoHour",{n:Math.floor(m/60)});
}
function fmtDist(m){return m<1000?Math.round(m)+" m":(m/1000).toFixed(1)+" km"}
function teamIcon(p,age,lv){
  var dash=lv===2?' stroke-dasharray="3 2"':'',txt=(lv===2?"! ":"")+fmtAge(age);
  var svg='<svg width="96" height="60" viewBox="-48 -30 96 60" style="overflow:visible" opacity="'+[1,.8,.55][lv]+'">'+
    '<circle class="hit" r="20" fill="transparent"/>'+   // 押せる範囲（指で押しやすい大きさ）
    '<circle r="10" fill="var(--panel)" stroke="var(--ink)" stroke-width="3"'+dash+'/><path d="M0,-6 L5,5 L0,2.5 L-5,5 Z" fill="var(--ink)"/>'+
    '<text y="-17" text-anchor="middle" font-size="12">'+esc(p.team)+'</text>'+
    '<text y="29" text-anchor="middle" font-size="11"'+(lv===2?' style="fill:var(--warn)"':'')+'>'+esc(txt)+'</text></svg>';
  return L.divIcon({html:svg,className:"pin-ic team-ic",iconSize:[96,60],iconAnchor:[48,30]});
}
function renderTeams(){
  teamLayer.clearLayers();
  if(!user)return;
  if(showTeams)teamPos.forEach(function(p){
    if(p.id===user.id)return; // 自分の位置は、いつもの現在地マークで表示
    var age=nowS()-p.t,lv=ageLevel(age);
    // 押せるのはまん中の丸だけ（CSS .team-ic）。ピンより奥に描くので、重なったときはピンが押せる
    var m=L.marker([p.lat,p.lng],{icon:teamIcon(p,age,lv),zIndexOffset:-500,keyboard:false});
    m.on("click",function(e){
      if(placing||vplacing){map.fire("click",{latlng:e.latlng});return}   // 置く場所を選んでいる途中なら、地図を押したのと同じ
      openTeamPop(p);
    });
    teamLayer.addLayer(m);
  });
  updateNearest();
}
function teamNavName(p){return p.team+"（"+p.id+"）"}
function openTeamPop(p){
  var age=nowS()-p.t,lv=ageLevel(age),me=navPos||gps,el=document.createElement("div");el.className="fac-pop";
  el.innerHTML='<small>'+esc(t("teamPosH"))+'</small><b>'+esc(teamNavName(p))+'</b>'+
    '<div class="tp-meta'+(lv===2?' old':'')+'">'+esc((lv===2?"! ":"")+fmtAge(age)+(me?" · "+t("fromHere",{d:fmtDist(distM(me,p))}):""))+'</div>'+
    '<button type="button" class="solid" data-nav="1">'+esc(t("navTeam"))+'</button>';
  el.querySelector("[data-nav]").onclick=function(){
    map.closePopup();
    // 相手が動いたら、目的地も一緒に動く（posId の位置を追いかける）
    navGo({lat:p.lat,lng:p.lng,name:teamNavName(p),posId:p.id,posT:p.t});
  };
  popAt([p.lat,p.lng],el,8);
}
function fetchPositions(){
  api("GET","/api/positions").then(function(r){
    teamPos=r.positions||[];posSkew=(r.now||Date.now())-Date.now();renderTeams();navTeamUpdate();
  },function(){});
}
// 編集画面：この現場に近い隊（応援の候補）を、距離の近い順に最大3隊
function updateNearest(){
  var el=$("nearteams");if(!el||!draft)return;
  var ex=draft.team||(user&&user.team),best={};
  teamPos.forEach(function(p){
    if(p.team===ex)return;
    var d=distM(p,draft);
    if(!best[p.team]||d<best[p.team].d)best[p.team]={p:p,d:d};
  });
  var list=Object.keys(best).map(function(k){return best[k]}).sort(function(a,b){return a.d-b.d}).slice(0,3);
  el.innerHTML='<div class="nt-h">'+esc(t("nearTeams"))+'</div>'+(list.length?list.map(function(x){
    var age=nowS()-x.p.t,lv=ageLevel(age);
    return '<div class="nt-row'+(lv===2?' old':'')+'"><b>'+esc(x.p.team)+'</b><span class="mono">'+fmtDist(x.d)+'</span><span>'+(lv===2?'! ':'')+esc(fmtAge(age))+'</span></div>';
  }).join(""):'<div class="nt-none">'+esc(t("nearNone"))+'</div>');
}
// 位置の送信：動いたとき(20m以上・15秒おき)と、止まっていても60秒おきに送る。画面を消している間は端末が位置を止める
function sendPos(cur){
  api("POST","/api/position",{lat:cur.lat,lng:cur.lng,accuracy:cur.accuracy}).then(function(){lastSent=Date.now();lastSentPos=cur},function(){});
}
function startShare(){
  stopWatch();
  if(!user||!shareLoc||!navigator.geolocation)return;
  watchId=navigator.geolocation.watchPosition(function(p){
    var cur={lat:p.coords.latitude,lng:p.coords.longitude,accuracy:p.coords.accuracy},now=Date.now();
    gps={lat:cur.lat,lng:cur.lng};showGps({lat:cur.lat,lng:cur.lng,acc:cur.accuracy});
    var moved=lastSentPos?distM(lastSentPos,cur):1e9;
    if(now-lastSent>=60000||(now-lastSent>=15000&&moved>=20))sendPos(cur);
  },function(){},{enableHighAccuracy:true,maximumAge:5000,timeout:30000});
}
function stopWatch(){if(watchId!=null&&navigator.geolocation){navigator.geolocation.clearWatch(watchId)}watchId=null}
function renderToggles(){
  if($("facSel"))renderFacSel();
  var a=$("shareBtn"),b=$("teamsBtn");
  a.textContent=t(shareLoc?"shareOn":"shareOff");a.classList.toggle("on",shareLoc);a.setAttribute("aria-pressed",shareLoc);
  b.textContent=t(showTeams?"teamsOn":"teamsOff");b.classList.toggle("on",showTeams);b.setAttribute("aria-pressed",showTeams);
}
$("shareBtn").onclick=function(){
  shareLoc=!shareLoc;S.set("ss_share",shareLoc);renderToggles();
  if(shareLoc){startShare();getPos().then(function(p){lastSent=0;sendPos(p)},function(){})}
  else{stopWatch();lastSentPos=null;api("DELETE","/api/position")["catch"](function(){})}
};
$("teamsBtn").onclick=function(){showTeams=!showTeams;S.set("ss_showteams",showTeams);renderToggles();renderTeams()};

/* ---------- 事前確認用の施設（病院・学校・工場・発電所・大型商業施設：OpenStreetMapのデータ） ----------
 * v2.11：病院を追加。表示する範囲の制限を「ズーム15以上」から「ズーム11以上（市全体が見える）」に広げた。
 *   データはズーム11のタイル（約16km四方）単位でサーバーから取得（インターネットに常時つながっている前提）。
 *   ズーム14未満では小さな丸（色で種類が分かる）、14以上では文字入りの四角で表示。種類の絞り込みは右上の「施設：」で。
 */
var FAC_Z=11,FAC_MINZOOM=11,FAC_ICONZOOM=14,FAC_TTL=7*24*3600*1000,FAC_KEEP=24,FAC_PAR=4,FAC_MAXTILES=24;
var FAC_KINDS=["hospital","school","factory","power","mall"];
var FAC_STYLE={hospital:{c:"#c2185b",ja:"病",en:"H"},school:{c:"#2c6fbf",ja:"学",en:"S"},factory:{c:"#8a5a1f",ja:"工",en:"F"},power:{c:"#c27c00",ja:"電",en:"P"},mall:{c:"#8a3fa0",ja:"商",en:"M"}};
var facKind=S.get("ss_fac")||"all",facTiles={},facLoading={},facTimer=null,facHinted=false;
var facLayer=L.layerGroup().addTo(map),facCanvas=L.canvas({padding:.3,tolerance:7});   // 縮小時は数が多いので、軽い canvas で描く（tolerance：小さな丸でも指で押しやすく）
(function(){ // 端末に保存した施設データ（電波が悪いときも、前に見た範囲は表示できるように）
  try{localStorage.removeItem("ss_fac_tiles")}catch(e){}   // v2.10 以前の保存（ズーム14・病院なし）は使わない
  var c=S.get("ss_fac2")||{},now=Date.now();
  Object.keys(c).forEach(function(k){if(c[k]&&now-c[k].t<FAC_TTL)facTiles[k]=c[k]});
})();
function saveFac(){
  var ks=Object.keys(facTiles).sort(function(a,b){return facTiles[b].t-facTiles[a].t}).slice(0,FAC_KEEP),o={};
  ks.forEach(function(k){o[k]=facTiles[k]});S.set("ss_fac2",o);
}
function facTilesInView(){   // 画面に入るタイル（画面の中心に近い順）
  var b=map.getBounds(),n=Math.pow(2,FAC_Z),out=[],c=map.getCenter();
  var tx=function(lng){return Math.floor((lng+180)/360*n)};
  var ty=function(lat){var r=lat*Math.PI/180;return Math.floor((1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*n)};
  var x0=tx(b.getWest()),x1=tx(b.getEast()),y0=Math.max(0,ty(b.getNorth())),y1=Math.min(n-1,ty(b.getSouth())),cx=tx(c.lng),cy=ty(c.lat);
  for(var x=x0;x<=x1;x++)for(var y=y0;y<=y1;y++)out.push({k:FAC_Z+"/"+(((x%n)+n)%n)+"/"+y,d:(x-cx)*(x-cx)+(y-cy)*(y-cy)});
  return out.sort(function(a,b){return a.d-b.d}).slice(0,FAC_MAXTILES).map(function(o){return o.k});
}
function facOn(){return !!user&&facKind!=="off"}
function loadFacilities(){
  if(!facOn())return renderFac();
  if(map.getZoom()<FAC_MINZOOM){
    if(!facHinted){facHinted=true;toast(t("facZoom"),3000)}
    return renderFac();
  }
  var busy=Object.keys(facLoading).length;
  facTilesInView().forEach(function(k){
    if(facTiles[k]||facLoading[k]||busy>=FAC_PAR)return;   // サーバー（Overpass）に負担をかけないよう、同時に4つまで
    facLoading[k]=true;busy++;
    api("GET","/api/facilities?tile="+k).then(function(r){facTiles[k]={t:Date.now(),items:r.items||[]};saveFac();renderFac()},function(){})
      .then(function(){delete facLoading[k];loadFacilities()});   // 残りのタイルを続けて読み込む
  });
  renderFac();
}
function facIcon(kind){
  var st=FAC_STYLE[kind],ch=lang==="ja"?st.ja:st.en;
  return L.divIcon({className:"pin-ic fac-ic",iconSize:[26,26],iconAnchor:[13,13],
    html:'<svg width="26" height="26" viewBox="-13 -13 26 26"><rect x="-11" y="-11" width="22" height="22" rx="3" fill="'+st.c+'" stroke="var(--panel)" stroke-width="2"/>'+
      '<text y="5" text-anchor="middle" font-size="14" style="fill:#fff">'+ch+'</text></svg>'});
}
function facName(f){return(lang==="en"&&f.nameEn)||f.name||t("facNoName")}
function openFacPop(f){
  var sub=I18N[lang]["s_"+f.sub]||t("k_"+f.kind),info=[];
  if(f.beds)info.push(t("facBeds",{n:f.beds}));   // 病院：病床数・救急（OpenStreetMap に登録がある場合）
  if(f.emg)info.push(t("facEmg"));
  var el=document.createElement("div");el.className="fac-pop";
  el.innerHTML='<small>'+esc(t("k_"+f.kind)+(sub!==t("k_"+f.kind)?" · "+sub:""))+'</small><b>'+esc(facName(f))+'</b>'+(info.length?'<div class="tp-meta">'+esc(info.join(" · "))+'</div>':'')+
    '<button type="button" class="solid">'+esc(t("facPin"))+'</button><button type="button" data-nav="1">'+esc(t("navGo"))+'</button>';
  el.querySelector("[data-nav]").onclick=function(){map.closePopup();navGo({lat:f.lat,lng:f.lng,name:facName(f)})};
  el.querySelector("button").onclick=function(){
    map.closePopup();
    var go=function(){var d=blank({lat:f.lat,lng:f.lng});d.name=facName(f)===t("facNoName")?"":facName(f);openSheet(d)};
    if($("sheet")&&isDirty())confirmDiscard("move",go);else go();
  };
  popAt([f.lat,f.lng],el,map.getZoom()>=FAC_ICONZOOM?8:4);   // 左上の表示・右のボタンに隠れない位置に出す
}
function facClick(f,e){
  if(vplacing){placeVictimAt(e.latlng);return}
  if(placing){map.fire("click",{latlng:e.latlng});return}   // 「地図で選ぶ」の途中は、地図を押したのと同じ
  openFacPop(f);
}
function renderFac(){
  facLayer.clearLayers();
  var attr=t("facAttr")+' &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';
  map.attributionControl.removeAttribution(I18N.ja.facAttr+' &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>');
  map.attributionControl.removeAttribution(I18N.en.facAttr+' &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>');
  if(!facOn()||map.getZoom()<FAC_MINZOOM)return;
  map.attributionControl.addAttribution(attr);
  var bb=map.getBounds().pad(0.3),seen={},big=map.getZoom()>=FAC_ICONZOOM;
  Object.keys(facTiles).forEach(function(k){(facTiles[k].items||[]).forEach(function(f){
    if(seen[f.id]||(facKind!=="all"&&f.kind!==facKind)||!FAC_STYLE[f.kind]||!bb.contains([f.lat,f.lng]))return;
    seen[f.id]=1;
    var m=big?L.marker([f.lat,f.lng],{icon:facIcon(f.kind),zIndexOffset:-500,title:facName(f)})
      :L.circleMarker([f.lat,f.lng],{renderer:facCanvas,radius:f.kind==="hospital"?6:5,weight:1.5,color:"#fff",fillColor:FAC_STYLE[f.kind].c,fillOpacity:.95,bubblingMouseEvents:false});
    m.on("click",function(e){facClick(f,e)});
    facLayer.addLayer(m);
  })});
}
function renderFacSel(){
  var opts=[["all","facAll"],["hospital","facHospital"],["school","facSchool"],["factory","facFactory"],["power","facPower"],["mall","facMall"],["off","facOff"]];
  $("facSel").innerHTML=opts.map(function(o){return '<option value="'+o[0]+'"'+(o[0]===facKind?" selected":"")+'>'+esc(t(o[1]))+'</option>'}).join("");
}
$("facSel").onchange=function(){facKind=this.value;S.set("ss_fac",facKind);facHinted=false;loadFacilities()};
map.on("moveend",function(){clearTimeout(facTimer);facTimer=setTimeout(loadFacilities,500)});
map.on("zoomend",renderFac);   // 縮小したらすぐ隠す（読み込みは moveend で）

/* ---------- 状況別リスト ---------- */
function closeListPanel(){var el=$("listpanel");if(el)el.remove();layoutPanels()}
function openStatusList(status){
  closeListPanel();closeSearch();
  var list=visible().filter(function(p){return +p.status===status});
  var el=document.createElement("div");el.className="listpanel";el.id="listpanel";
  el.style.top=($$(".tl")[0].offsetHeight+18)+"px";
  el.innerHTML='<div class="lp-top"><b>'+esc(t("st"+status))+'（'+list.length+'）</b><button id="lpx" type="button">'+esc(t("close"))+'</button></div>'+
    (list.length?list.map(function(p){return '<button type="button" class="lp-row" data-id="'+esc(p.id)+'">'+esc((p.name||t("unnamed"))+(p.floor?" "+p.floor:""))+'</button>'}).join(""):'<div class="lp-empty">'+esc(t("none"))+'</div>');
  $("stage").appendChild(el);
  $("lpx").onclick=closeListPanel;
  el.addEventListener("click",function(e){
    var b=e.target.closest(".lp-row");if(!b)return;
    var p=pins.filter(function(x){return String(x.id)===b.getAttribute("data-id")})[0];
    if(!p)return;
    var editing=!!$("sheet");
    var go=function(){
      if(stFilter.length&&stFilter.indexOf(+p.status)<0)stFilter.push(+p.status); // 絞り込みで隠れているピンは表示に追加
      map.setView([p.lat,p.lng],Math.max(map.getZoom(),18));
      closeListPanel();
      if(editing)openSheet(JSON.parse(JSON.stringify(p)));else render();
    };
    if(editing&&draft&&draft.id===p.id){map.setView([p.lat,p.lng],Math.max(map.getZoom(),18));closeListPanel();return}
    if(editing&&isDirty())confirmDiscard("move",go);else go();
  });
  layoutPanels();
}
$("cnt").addEventListener("click",function(e){
  var f=e.target.closest("[data-f]");
  if(f){var i=+f.getAttribute("data-f"),k=stFilter.indexOf(i);if(k>=0)stFilter.splice(k,1);else stFilter.push(i);render();return}
  if(e.target.closest("#fall")){stFilter=[];render();return}
  var el=e.target.closest("[data-status]");if(!el)return;
  openStatusList(+el.getAttribute("data-status"));
});

/* ---------- 住所検索 ---------- */
function closeSearch(){var el=$("srch");if(el)el.remove()}
function openSearch(){
  var prev=$("sq")?$("sq").value:"";
  closeSearch();closeListPanel();closeSheet();setPlacing(false);
  var el=document.createElement("div");el.className="srch";el.id="srch";
  el.innerHTML='<form id="sf"><input id="sq" enterkeyhint="search" placeholder="'+esc(t("addrSearchPh"))+'" aria-label="'+esc(t("address"))+'"><button class="solid" type="submit">'+esc(t("search"))+'</button><button type="button" id="sxx">'+esc(t("close"))+'</button></form><div id="sr"></div>';
  $("stage").appendChild(el);
  $("sq").value=prev;$("sq").focus();
  $("sxx").onclick=closeSearch;
  $("sf").onsubmit=function(e){
    e.preventDefault();var q=$("sq").value.trim();if(!q)return;
    $("sr").innerHTML='<div class="msg">'+esc(t("searching"))+'</div>';
    api("GET","/api/geocode?q="+encodeURIComponent(q)+"&lang="+lang).then(function(list){
      if(!$("sr"))return;
      // 住所を押す → その場所にピン ／ 「ナビ」→ ピンを置かずに、その場所へナビ
      $("sr").innerHTML=list.length?list.map(function(r,i){return '<div class="sr-row"><button type="button" class="lp-row" data-i="'+i+'">'+esc(r.label)+'</button>'+
        '<button type="button" class="sr-nav" data-n="'+i+'" aria-label="'+esc(t("navGo")+"："+r.label)+'">'+esc(t("navShort"))+'</button></div>'}).join(""):'<div class="msg">'+esc(t("noResult"))+'</div>';
      $("sr").onclick=function(ev){
        var n=ev.target.closest(".sr-nav");
        if(n){var q=list[+n.getAttribute("data-n")];closeSearch();startNav({lat:q.lat,lng:q.lng,name:q.label});return}
        var b=ev.target.closest(".lp-row");if(!b)return;var r=list[+b.getAttribute("data-i")];
        closeSearch();map.setView([r.lat,r.lng],18);
        var d=blank({lat:r.lat,lng:r.lng});d.address=r.label;openSheet(d);
      };
    },function(e){if($("sr"))$("sr").innerHTML='<div class="msg">'+esc(e&&e._net?t("noServer"):t("geoFail"))+'</div>'});
  };
}
$("addr").onclick=function(){if($("srch"))closeSearch();else openSearch()};

/* ---------- ピン ---------- */
function blank(ll){return{lat:ll.lat,lng:ll.lng,name:"",status:1,go:true,live:0,dead:0,missing:0,hazard:"",address:"",floor:"",note:"",startAt:Date.now(),endAt:null}}
function setPlacing(v){placing=v;$("pick").classList.toggle("on",v);$("hint").classList.toggle("hide",!v)}
$("pick").onclick=function(){closeSheet();closeSearch();setPlacing(!placing)};
$("here").onclick=function(){
  setPlacing(false);closeSearch();
  getPos().then(function(p){
    gps=p;showGps(p);map.setView([p.lat,p.lng],Math.max(map.getZoom(),18));openSheet(blank(p));
  },function(){
    var ctr=wrapLL(map.getCenter());toast(t("gpsFallback"));openSheet(blank({lat:ctr.lat,lng:ctr.lng}));
  });
};
function toInput(ms){if(!ms)return"";var d=new Date(ms);return new Date(ms-d.getTimezoneOffset()*60000).toISOString().slice(0,16)}
function fromInput(v){if(!v)return null;var n=new Date(v).getTime();return isNaN(n)?null:n}
function collectForm(){
  if(!draft||!$("sheet"))return;
  draft.name=$("pn").value.trim();draft.address=$("pa").value.trim();   // draft.floor（旧「階」欄）はそのまま残す
  draft.hazard=$("ph").value.trim();draft.note=$("pt").value.trim();
  draft.startAt=fromInput($("ps0").value);draft.endAt=fromInput($("ps1").value);
  $$("#bldfields .step").forEach(function(st){var i=st.querySelector("input"),v=parseInt(i.value,10);
    draft[st.getAttribute("data-k")]=isNaN(v)||v<0?0:Math.min(v,99999)});
}
function lookupAddress(d,force){
  api("GET","/api/reverse?lat="+d.lat+"&lng="+d.lng+"&lang="+lang).then(function(r){
    if(draft===d&&$("pa")&&(force||!$("pa").value)&&r.label){$("pa").value=r.label;d.address=r.label;if(!force&&base)base.address=r.label}
  },function(){});
}
/* ---------- 未保存の変更の警告・ピン切り替え ---------- */
function fieldsOf(d){return{name:d.name||"",floor:d.floor||"",address:d.address||"",hazard:d.hazard||"",note:d.note||"",
  status:+d.status,go:!!d.go,live:+d.live||0,dead:+d.dead||0,missing:+d.missing||0,startAt:d.startAt||null,endAt:d.endAt||null,
  floors:hasFloors(d)?JSON.stringify(d.floors):null}}
function isDirty(){
  if(!draft||!$("sheet")||!base)return false;
  collectForm();
  return JSON.stringify(fieldsOf(draft))!==JSON.stringify(base);
}
function confirmBox(title,msg,keepKey,okKey,onOk){
  var old=$("cfm");if(old)old.remove();
  var el=document.createElement("div");el.className="modal";el.id="cfm";
  el.innerHTML='<div class="box" role="alertdialog" aria-modal="true" aria-labelledby="cfmT"><h1 id="cfmT">'+esc(t(title))+'</h1>'+
    '<p class="cfm-msg">'+esc(t(msg))+'</p>'+
    '<div class="mrow"><button id="cfmKeep" class="solid" type="button">'+esc(t(keepKey))+'</button>'+
    '<button id="cfmOk" class="del" type="button">'+esc(t(okKey))+'</button></div></div>';
  document.body.appendChild(el);
  var onKey=function(e){if(e.key==="Escape"){e.preventDefault();done()}};
  var done=function(){el.remove();document.removeEventListener("keydown",onKey)};
  document.addEventListener("keydown",onKey);
  $("cfmKeep").onclick=done;
  $("cfmOk").onclick=function(){done();onOk()};
  el.addEventListener("click",function(e){if(e.target===el)done()});
  $("cfmKeep").focus();
}
function confirmDiscard(kind,onOk){
  var close=kind==="close";
  confirmBox("unsavedTitle",close?"unsavedClose":"unsavedMove","keepEditing",close?"discardClose":"discardMove",onOk);
}
function requestClose(){
  if(!$("sheet"))return;
  if(isDirty())confirmDiscard("close",function(){closeSheet()});else closeSheet();
}
// 編集画面を開いたまま別のピンを選ぶ：未保存の変更があるときだけ警告、なければ即座に切り替え
function openPinEdit(p,pan){
  var view=function(){if(pan)map.setView([p.lat,p.lng],Math.max(map.getZoom(),18))};
  if($("sheet")&&draft&&draft.id===p.id){view();return}
  var go=function(){view();openSheet(JSON.parse(JSON.stringify(p)))};
  if($("sheet")&&isDirty())confirmDiscard("move",go);else go();
}
// 狭い画面で編集画面と一覧を同時に出すとき、重ならないように高さを分ける
function revealUnderSheet(d){
  var sh=$("sheet");if(!sh)return;
  var W=$("stage").clientWidth,H=$("stage").clientHeight,pt=map.latLngToContainerPoint([d.lat,d.lng]);
  if(window.innerWidth>=720){
    var vw=W-sh.offsetWidth;
    if(pt.x>vw-30)map.panBy([pt.x-vw/2,0],{animate:true});
  }else{
    var vis=H-sh.offsetHeight;
    if(pt.y>vis-40)map.panBy([0,pt.y-Math.max(vis*0.55,110)],{animate:true});
  }
}
function layoutPanels(){
  var sh=$("sheet"),lp=$("listpanel");
  if(sh)sh.style.maxHeight="";
  if(lp)lp.style.maxHeight="";
  return;   // v2.11〜 スマホでは編集画面が全画面なので、一覧と高さを分け合わない
  if(!sh||!lp||window.innerWidth>=720)return;
  var H=$("stage").clientHeight,top=parseFloat(lp.style.top)||0,shH=Math.round(H*0.5);
  sh.style.maxHeight=shH+"px";
  lp.style.maxHeight=Math.max(110,H-shH-8-top)+"px";
}
/* ---------- 階数・店舗・区画の入力画面 ---------- */
function newEntry(x){var e={status:0,go:true,live:0,dead:0,missing:0,hazard:"",note:"",startAt:null,endAt:null};for(var k in x)e[k]=x[k];return e}
function stGlyph(st){return '<svg width="16" height="16" viewBox="-8 -8 16 16" aria-hidden="true">'+glyph(st,7,"var(--st"+st+")")+'</svg>'}
function entryFor(el){var f=draft.floors[+el.getAttribute("data-f")],s=el.getAttribute("data-s");return s!=null&&s!==""?f.shops[+s]:f}
function fAttr(f,s){return 'data-f="'+f+'"'+(s==null?'':' data-s="'+s+'"')}
function segF(k,items,cur,a){return '<div class="seg" '+a+' data-k="'+k+'" role="group">'+items.map(function(x){return '<button type="button" data-v="'+x[0]+'"'+(String(cur)===String(x[0])?' class="on"':'')+'>'+esc(x[1])+'</button>'}).join("")+'</div>'}
function stpF(k,l,v,a){return '<div class="row"><span>'+esc(l)+'</span><div class="step" '+a+' data-k="'+k+'"><button type="button" data-d="-10" aria-label="'+esc(t("dec10"))+'">−10</button><button type="button" data-d="-1" aria-label="'+esc(t("dec"))+'">−1</button>'+
  '<input class="num mono" type="number" inputmode="numeric" min="0" max="99999" step="1" '+a+' data-k="'+k+'" aria-label="'+esc(l)+'" value="'+(+v||0)+'">'+
  '<button type="button" data-d="1" aria-label="'+esc(t("inc"))+'">+1</button><button type="button" data-d="10" aria-label="'+esc(t("inc10"))+'">+10</button></div></div>'}
function timeF(k,l,v,a){return '<div class="two"><div><span class="lb">'+esc(l)+'</span><div class="trow"><input type="datetime-local" '+a+' data-k="'+k+'" aria-label="'+esc(l)+'" value="'+esc(toInput(v))+'">'+
  '<button type="button" data-act="now" '+a+' data-k="'+k+'">'+esc(t("now"))+'</button></div></div></div>'}
function eFields(e,f,s,withName,noteLabel){
  var a=fAttr(f,s),h='';
  if(withName)h+='<span class="lb">'+esc(t("shopName"))+'</span><input '+a+' data-k="name" aria-label="'+esc(t("shopName"))+'" value="'+esc(e.name||"")+'" placeholder="'+esc(t("shopNamePh"))+'">';
  h+='<span class="lb">'+esc(t("status"))+'</span>'+segF("status",[[0,"□ "+t("st0")],[1,"◪ "+t("st1")],[2,"■ "+t("st2s")]],e.status,a);
  h+='<span class="lb">'+esc(t("entry"))+'</span>'+segF("go",[[true,t("goYes")],[false,t("goNo")]],e.go!==false,a);
  h+=stpF("missing",t("missing"),e.missing,a)+stpF("live",t("live"),e.live,a)+stpF("dead",t("dead"),e.dead,a);
  h+='<span class="lb">'+esc(t("hazard"))+'</span><input '+a+' data-k="hazard" aria-label="'+esc(t("hazard"))+'" value="'+esc(e.hazard||"")+'" placeholder="'+esc(t("hazardPh"))+'">';
  h+=timeF("startAt",t("startT"),e.startAt,a)+timeF("endAt",t("endT"),e.endAt,a);
  h+=noteF(e,a,noteLabel||t("note"));
  return h;
}
function noteF(e,a,label){return '<span class="lb">'+esc(label)+'</span><textarea '+a+' data-k="note" rows="2" aria-label="'+esc(label)+'" placeholder="'+esc(t("notePh"))+'">'+esc(e.note||"")+'</textarea>'}
function cText(v){return(v.missing||v.live||v.dead)?"M"+v.missing+" L"+v.live+" D"+v.dead:""}
function renderFloors(){
  var box=$("flbox");if(!box||!draft)return;
  var fl=draft.floors,on=fl!=null,h='',i,j;
  h+='<div class="fl-h"><i></i><span>'+esc(t("floorsT"))+'</span></div><p class="fl-hint">'+esc(t("floorsHint"))+'</p>';
  h+='<div class="seg" role="group" aria-label="'+esc(t("floorsT"))+'"><button type="button" data-act="fmode" data-v="off"'+(on?'':' class="on"')+'>'+esc(t("floorsNone"))+'</button>'+
     '<button type="button" data-act="fmode" data-v="on"'+(on?' class="on"':'')+'>'+esc(t("floorsInput"))+'</button></div>';
  if(on&&!fl.length){
    h+='<div class="fl-dim"><div><span class="lb">'+esc(t("above"))+'</span><div class="trow"><input id="fa" type="number" inputmode="numeric" min="0" max="99" value="1" aria-label="'+esc(t("above"))+'"><span>'+esc(t("floorUnit"))+'</span></div></div>'+
       '<div><span class="lb">'+esc(t("below"))+'</span><div class="trow"><input id="fb" type="number" inputmode="numeric" min="0" max="20" value="0" aria-label="'+esc(t("below"))+'"><span>'+esc(t("floorUnit"))+'</span></div></div></div>'+
       '<button type="button" class="solid" id="fmake" data-act="make" style="width:100%;margin-top:14px">'+esc(t("makeTabs",{n:1}))+'</button>';
  }else if(on){
    h+='<div class="fl-sum" id="flsum"></div><div class="fl-bar" id="flbar"></div><div class="fl-list">';
    for(i=0;i<fl.length;i++){
      var f=fl[i],v=floorView(f),open=!!fo[i],sh=f.shops||[];
      h+='<button type="button" class="fl-row'+(open?' open':'')+'" data-act="ftab" data-f="'+i+'" aria-expanded="'+open+'"><span class="fl-n">'+esc(f.label)+'</span>'+
         '<span class="fl-gl" data-f="'+i+'">'+stGlyph(v.status)+'</span><span class="fl-s" data-f="'+i+'">'+esc(t("st"+v.status))+'</span>'+
         '<span class="fl-c" data-f="'+i+'">'+esc(cText(v))+'</span>'+
         (sh.length?'<span class="fl-chips">'+sh.map(function(x){return stGlyph(+x.status||0)}).join("")+'</span>':'')+'<span>'+(open?'▴':'▾')+'</span></button>';
      if(open){
        h+='<div class="fl-body">';
        if(!sh.length)h+=eFields(f,i,null,false,t("floorNote"));
        else{
          h+='<span class="lb">'+esc(t("status"))+'<span class="autoi">'+esc(t("autoTag"))+'</span></span>'+
             '<div class="autob" data-f="'+i+'"></div><p class="rules">'+t("autoRule").split("|").map(esc).join("<br>")+'</p>'+
             '<span class="lb">'+esc(t("totals"))+'</span><div class="tots">'+
             [["missing","missing"],["live","live"],["dead","dead"]].map(function(x){return '<div><small>'+esc(t(x[1]))+'</small><b data-tot="'+x[0]+'" data-f="'+i+'">0</b></div>'}).join("")+'</div>'+
             noteF(f,fAttr(i,null),t("floorNote"))+'<p class="rules">'+esc(t("shopOnlyHint"))+'</p>';
        }
        h+='<div class="fl-sub"><i></i><span>'+esc(t("shopsT"))+'</span><span class="rules" style="margin:0">'+esc(t("shopsIn"))+'</span></div><div class="fl-list">';
        for(j=0;j<sh.length;j++){
          var s=sh[j],sopen=!!so[i+"."+j];
          h+='<button type="button" class="fl-row sm'+(sopen?' open':'')+'" data-act="stab" data-f="'+i+'" data-s="'+j+'" aria-expanded="'+sopen+'"><span class="fl-s" data-nm="'+i+'.'+j+'">'+esc(s.name||t("unnamed"))+'</span>'+
             stGlyph(+s.status||0)+'<span>'+esc(t("st"+(+s.status||0)))+'</span><span>'+(sopen?'▴':'▾')+'</span></button>';
          if(sopen){
            h+='<div class="sh-body">'+eFields(s,i,j,true)+'<button type="button" class="fl-del" data-act="delshop" data-f="'+i+'" data-s="'+j+'">'+esc(t("shopDel"))+'</button>'+'</div>';
          }
        }
        h+='</div><button type="button" class="fl-add" data-act="addshop" data-f="'+i+'">'+esc(t("addShop"))+'</button>';
        h+='<div class="fl-ph" data-fph="'+i+'"></div>';
        h+='<button type="button" class="fl-del" data-act="delfloor" data-f="'+i+'">'+esc(t("floorDel"))+'</button>';
        h+='</div>';
      }
    }
    h+='</div><div class="fl-addrow"><div style="flex:1"><span class="lb">'+esc(t("addFloorOk"))+'</span><input id="fnew" aria-label="'+esc(t("addFloorOk"))+'" placeholder="'+esc(t("floorLabelPh"))+'"></div>'+
       '<button type="button" data-act="addfloor">'+esc(t("addFloorOk"))+'</button></div>';
  }
  box.innerHTML=h;
  drawFloorPhotos();
  var fx=hasFloors(draft);
  $("bldfields").classList.toggle("hide",fx);
  $("ptl").textContent=fx?t("bldNote"):t("note");
  var q=document.querySelector("#sheet .quick");if(q)q.classList.toggle("hide",fx);
  refreshDerived();
}
function refreshDerived(){
  updateTotal();
  var box=$("flbox");if(!box||!hasFloors(draft))return;
  draft.floors.forEach(function(f,i){
    var v=floorView(f),q=function(s){return box.querySelector(s+'[data-f="'+i+'"]')};
    var g=q(".fl-gl"),w=q(".fl-s"),c=q(".fl-c");
    if(g)g.innerHTML=stGlyph(v.status);if(w)w.textContent=t("st"+v.status);if(c)c.textContent=cText(v);
    var ab=q(".autob");if(ab)ab.innerHTML=stGlyph(v.status)+'<span>'+esc(t("st"+v.status))+'</span>';
    ["missing","live","dead"].forEach(function(k){var b=box.querySelector('[data-tot="'+k+'"][data-f="'+i+'"]');if(b)b.textContent=v[k]});
  });
  var done=draft.floors.filter(function(f){return floorView(f).status===2}).length;
  var sm=$("flsum");if(sm)sm.textContent=t("doneOf",{n:done,m:draft.floors.length});
  var bar=$("flbar");
  if(bar)bar.innerHTML=draft.floors.slice().reverse().map(function(f){var st=floorView(f).status;return '<span style="background:var(--st'+st+')" title="'+esc(f.label)+'"></span>'}).join("");
}
function setFloorsMode(on){
  if(on){if(draft.floors==null)draft.floors=[];return renderFloors()}
  if(!hasFloors(draft)){draft.floors=null;return renderFloors()}
  confirmBox("floorsOffTitle","floorsOffMsg","keepEditing","floorsOffOk",function(){draft.floors=null;fo={};so={};renderFloors()});
}
function makeFloors(){
  var a=Math.min(Math.max(parseInt($("fa").value,10)||0,0),99),b=Math.min(Math.max(parseInt($("fb").value,10)||0,0),20),list=[],i;
  if(a+b<1)return toast(t("makeNone"));
  for(i=a;i>=1;i--)list.push(newEntry({label:i+"F",shops:[]}));
  for(i=1;i<=b;i++)list.push(newEntry({label:"B"+i,shops:[]}));
  draft.floors=list;fo={};so={};renderFloors();
}
function addFloor(){
  var label=$("fnew").value.trim();if(!label)return;
  if(draft.floors.some(function(f){return f.label===label}))return toast(t("floorDup"));
  draft.floors.push(newEntry({label:label,shops:[]}));fo[draft.floors.length-1]=true;renderFloors();
}
function addShop(fi){
  var F=draft.floors[fi],first=!F.shops.length;
  var s=newEntry({id:"s"+Math.random().toString(36).slice(2,10),name:""});
  if(first){ // 最初の店舗・区画には、その階にすでに入力した内容を引き継ぐ
    ["status","go","live","dead","missing","hazard","startAt","endAt"].forEach(function(k){s[k]=F[k]});
  }
  F.shops.push(s);fo[fi]=true;so[fi+"."+(F.shops.length-1)]=true;renderFloors();
  var inp=$("flbox").querySelector('input[data-f="'+fi+'"][data-s="'+(F.shops.length-1)+'"][data-k="name"]');if(inp)inp.focus();
}
function firstUnnamedShop(){
  for(var i=0;i<draft.floors.length;i++){
    var sh=draft.floors[i].shops||[];
    for(var j=0;j<sh.length;j++)if(!(sh[j].name||"").trim()){fo[i]=true;so[i+"."+j]=true;renderFloors();return true}
  }
  return false;
}
function onFlClick(e){
  var b=e.target.closest("button");if(!b||!$("flbox").contains(b))return;
  e.stopPropagation(); // 再描画でボタンが消えるので、外側の（編集画面全体の）クリック処理には渡さない
  var act=b.getAttribute("data-act"),f=b.getAttribute("data-f"),s=b.getAttribute("data-s"),par=b.parentNode;
  if(act==="fmode")return setFloorsMode(b.getAttribute("data-v")==="on");
  if(act==="make")return makeFloors();
  if(act==="addfloor")return addFloor();
  if(act==="ftab"){fo[f]=!fo[f];return renderFloors()}
  if(act==="stab"){var key=f+"."+s;so[key]=!so[key];return renderFloors()}
  if(act==="addshop")return addShop(+f);
  if(act==="delshop")return confirmBox("delTitle","delShopMsg","keepEditing","delOk",function(){
    draft.floors[+f].shops.splice(+s,1);Object.keys(so).forEach(function(k){if(k.indexOf(f+".")===0)delete so[k]});renderFloors()});
  if(act==="delfloor")return confirmBox("delTitle","delFloorMsg","keepEditing","delOk",function(){
    draft.floors.splice(+f,1);fo={};so={};renderFloors()});
  if(act==="now"){var en=entryFor(b),k=b.getAttribute("data-k");en[k]=Date.now();var inp=par.querySelector("input");if(inp)inp.value=toInput(en[k]);return}
  if(b.hasAttribute("data-v")&&par.classList.contains("seg")){
    var e2=entryFor(par),k2=par.getAttribute("data-k"),v=b.getAttribute("data-v");
    e2[k2]=k2==="go"?v==="true":+v;
    if(k2==="status"&&e2.status>=1&&!e2.startAt)e2.startAt=Date.now();
    if(k2==="status"&&e2.status===2&&!e2.endAt)e2.endAt=Date.now();
    return renderFloors();
  }
  if(b.hasAttribute("data-d")&&par.classList.contains("step")){
    var e3=entryFor(par),k3=par.getAttribute("data-k");
    e3[k3]=Math.min(99999,Math.max(0,(+e3[k3]||0)+ +b.getAttribute("data-d")));return renderFloors();
  }
}
function onFlInput(e){
  var i=e.target;
  if(i.id==="fa"||i.id==="fb"){
    var n=(parseInt($("fa").value,10)||0)+(parseInt($("fb").value,10)||0);$("fmake").textContent=t("makeTabs",{n:Math.max(n,0)});return;
  }
  var k=i.getAttribute("data-k");if(!k||i.getAttribute("data-f")==null)return;
  var en=entryFor(i);
  if(i.classList.contains("num")){var v=parseInt(i.value,10);en[k]=isNaN(v)||v<0?0:Math.min(v,99999);refreshDerived();return}
  if(i.type==="datetime-local"){en[k]=fromInput(i.value);return}
  en[k]=i.value;
  if(k==="name"){var nm=$("flbox").querySelector('[data-nm="'+i.getAttribute("data-f")+'.'+i.getAttribute("data-s")+'"]');if(nm)nm.textContent=i.value.trim()||t("unnamed")}
}
function onFlChange(e){
  var i=e.target;if(!i.classList||!i.classList.contains("num")||i.getAttribute("data-f")==null)return;
  i.value=entryFor(i)[i.getAttribute("data-k")];
}
function openSheet(d,keep){
  closeSearch();d.missing=d.missing||0;draft=d;closeSheet(true);$("bar").classList.add("hide");
  if(!keep){fo={};so={};hadFloors=hasFloors(d)&&typeof d.id==="number"}
  render();
  var el=document.createElement("div");el.className="sheet";el.id="sheet";
  var seg=function(k,items,cur,cls){return '<div class="seg'+(cls?' '+cls:'')+'" data-k="'+k+'">'+items.map(function(x){return '<button type="button" data-v="'+x[0]+'"'+(String(cur)===String(x[0])?' class="on"':'')+'>'+esc(x[1])+'</button>'}).join("")+'</div>'};
  var stp=function(k,l){return '<div class="row"><span>'+esc(l)+'</span><div class="step" data-k="'+k+'"><button type="button" data-d="-10" aria-label="'+esc(t("dec10"))+'">−10</button><button type="button" data-d="-1" aria-label="'+esc(t("dec"))+'">−1</button>'+
    '<input class="num mono" type="number" inputmode="numeric" min="0" max="99999" step="1" aria-label="'+esc(l)+'">'+
    '<button type="button" data-d="1" aria-label="'+esc(t("inc"))+'">+1</button><button type="button" data-d="10" aria-label="'+esc(t("inc10"))+'">+10</button></div></div>'};
  var isNew=!d.id,own=user&&d.team===user.team;
  var near=isNew?pins.filter(function(p){return distM(p,d)<=DUP_M}).map(function(p){return{p:p,m:Math.round(distM(p,d))}}).sort(function(a,b){return a.m-b.m}).slice(0,3):[];
  var meta=isNew?"":'<div class="meta">'+esc(t("created"))+': '+esc((d.team||"")+" / "+(d.by||""))+
    (d.t?'<br>'+esc(t("updated"))+': '+esc((d.updatedBy||d.by||"")+" · "+fmtTime(d.t)):"")+'</div>';
  var fx=hasFloors(d),quickOn=!isNew&&!fx,detailOpen=!quickOn||S.get("ss_detail")==="open";
  var quick=quickOn?'<div class="quick"><div class="qname">'+esc(d.name||t("unnamed"))+(d.floor?" "+esc(d.floor):"")+'</div>'+
    seg("status",[[0,t("qSt0")],[1,t("qSt1")],[2,t("qSt2")]],d.status,"qseg")+
    '<button type="button" class="dtgl" id="pdt" aria-expanded="'+detailOpen+'"><span>'+esc(t("detailBtn"))+'</span><span id="pdta">'+(detailOpen?"▴":"▾")+'</span></button></div>':'';
  el.innerHTML='<div class="sh-top"><h2>'+esc(isNew?t("newPin"):t("editPin"))+(d._pending?'<span class="tag">'+esc(t("unsent"))+'</span>':'')+'</h2><button id="pc" type="button">'+esc(t("close"))+'</button><button class="solid" id="ps" type="button">'+esc(t("save"))+'</button></div>'+
   '<div class="corow"><span class="co mono">'+d.lat.toFixed(5)+', '+d.lng.toFixed(5)+'</span>'+(d.id?'<button type="button" class="lbtn" id="pnav">'+esc(t("navGo"))+'</button>':'')+'</div>'+meta+
   (near.length?'<div class="warnbox" role="alert">⚠ '+esc(t("dupWarn"))+near.map(function(x){return '<button type="button" data-near="'+esc(x.p.id)+'">'+esc((x.p.name||t("unnamed"))+" — "+t("st"+x.p.status)+" · "+(x.p.team||"")+" · "+x.m+"m")+'</button>'}).join("")+'</div>':'')+
   '<div class="nearteams" id="nearteams"></div>'+
   quick+
   '<div id="detail"'+(detailOpen?'':' class="hide"')+'>'+
   '<div class="two"><div><label for="pn">'+esc(t("name"))+'</label><input id="pn" placeholder="'+esc(t("namePh"))+'"></div>'+
   '<div style="flex:0 0 36%"><label>'+esc(t("totalPeople"))+'</label><div class="ptot" id="ptot" aria-live="polite"><b class="mono"></b><small class="mono"></small></div></div></div>'+
   '<div class="lrow"><label for="pa">'+esc(t("address"))+'</label><button type="button" class="lbtn" id="pag">'+esc(t("addrGet"))+'</button></div><input id="pa" placeholder="'+esc(t("addrPh"))+'">'+
   '<div class="fl" id="flbox"></div>'+
   '<div id="bldfields"'+(fx?' class="hide"':'')+'>'+
   '<label>'+esc(t("status"))+'</label>'+
   seg("status",[[0,"□ "+t("st0")],[1,"◪ "+t("st1")],[2,"■ "+t("st2s")]],d.status)+
   '<label>'+esc(t("entry"))+'</label>'+seg("go",[[true,t("goYes")],[false,t("goNo")]],d.go)+
   stp("missing",t("missing"))+stp("live",t("live"))+stp("dead",t("dead"))+
   '<label for="ph">'+esc(t("hazard"))+'</label><input id="ph" placeholder="'+esc(t("hazardPh"))+'">'+
   '<div class="two"><div><label for="ps0">'+esc(t("startT"))+'</label><div class="trow"><input id="ps0" type="datetime-local"><button type="button" data-now="ps0">'+esc(t("now"))+'</button></div></div></div>'+
   '<div class="two"><div><label for="ps1">'+esc(t("endT"))+'</label><div class="trow"><input id="ps1" type="datetime-local"><button type="button" data-now="ps1">'+esc(t("now"))+'</button></div></div></div>'+
   '</div>'+
   '<label for="pt" id="ptl">'+esc(fx?t("bldNote"):t("note"))+'</label><textarea id="pt" rows="3" placeholder="'+esc(t("notePh"))+'"></textarea>'+
   '</div>'+
   '<div class="sec" id="vsec"></div><div class="sec" id="phsec"></div>'+
   (d.id&&(own||isHQ()||isTmp(d.id))?'<div class="acts"><button class="del" id="pd" type="button">'+esc(t("del"))+'</button></div>':'');
  $("stage").appendChild(el);
  updateNearest();renderVictimList();renderPhotos(d);
  // 値はinnerHTMLではなくプロパティで入れる（XSS対策）
  $("pn").value=d.name||"";$("pa").value=d.address||"";$("ph").value=d.hazard||"";$("pt").value=d.note||"";
  $("ps0").value=toInput(d.startAt);$("ps1").value=toInput(d.endAt);
  $$("#bldfields .step").forEach(function(st){st.querySelector("input").value=d[st.getAttribute("data-k")]||0});
  renderFloors();updateTotal();
  collectForm();if(!keep||!base)base=fieldsOf(draft);   // 編集開始時点の内容を記録（未保存の変更の検出用）
  if(isNew&&!d.address)lookupAddress(d,false);
  $("pag").onclick=function(){lookupAddress(d,true)};
  var fb=$("flbox");
  fb.addEventListener("click",onFlClick);fb.addEventListener("input",onFlInput);fb.addEventListener("change",onFlChange);
  fb.addEventListener("focusin",function(e){var i=e.target;if(i.classList&&i.classList.contains("num"))i.select()});
  if($("pdt"))$("pdt").onclick=function(){
    var dt=$("detail"),open=dt.classList.contains("hide");
    dt.classList.toggle("hide",!open);this.setAttribute("aria-expanded",open);$("pdta").textContent=open?"▴":"▾";S.set("ss_detail",open?"open":"closed");
  };
  el.addEventListener("click",function(e){
    var b=e.target.closest("button");if(!b||b.closest("#flbox"))return;
    if(b.hasAttribute("data-near")){var id=b.getAttribute("data-near");var p=pins.filter(function(x){return String(x.id)===id})[0];
      if(p)openPinEdit(p,true);return}
    if(b.hasAttribute("data-now")){$(b.getAttribute("data-now")).value=toInput(Date.now());return}
    var g=b.parentNode.getAttribute("data-k");
    if(b.hasAttribute("data-v")){var v=b.getAttribute("data-v");draft[g]=g==="go"?v==="true":+v;
      // かんたん操作と詳しい入力の、同じ項目のボタンをそろえる
      $$('.quick .seg[data-k="'+g+'"], #bldfields .seg[data-k="'+g+'"]').forEach(function(sg){
        Array.prototype.forEach.call(sg.children,function(x){x.classList.toggle("on",x.getAttribute("data-v")===v)})});
      // 状況に合わせて捜索開始/終了時刻を自動入力（空欄のときだけ）
      if(g==="status"&&draft.status>=1&&!$("ps0").value)$("ps0").value=toInput(Date.now());
      if(g==="status"&&draft.status===2&&!$("ps1").value)$("ps1").value=toInput(Date.now());
      if(b.parentNode.classList.contains("qseg"))save({stay:true});   // かんたん操作：押した時点で保存する
    }
    else if(b.hasAttribute("data-d")){draft[g]=Math.min(99999,Math.max(0,(+draft[g]||0)+ +b.getAttribute("data-d")));b.parentNode.querySelector("input").value=draft[g];updateTotal()}
  });
  // 数字は直接入力もできる（入力中は空欄を許可し、確定時に整える）
  el.addEventListener("input",function(e){
    var i=e.target;if(!i.classList||!i.classList.contains("num")||i.closest("#flbox"))return;
    var v=parseInt(i.value,10);draft[i.parentNode.getAttribute("data-k")]=isNaN(v)||v<0?0:Math.min(v,99999);updateTotal();
  });
  el.addEventListener("change",function(e){
    var i=e.target;if(!i.classList||!i.classList.contains("num")||i.closest("#flbox"))return;
    i.value=draft[i.parentNode.getAttribute("data-k")];
  });
  el.addEventListener("focusin",function(e){var i=e.target;if(i.classList&&i.classList.contains("num")&&!i.closest("#flbox"))i.select()});
  layoutPanels();
  if(!keep)revealUnderSheet(d);
  $("pc").onclick=requestClose;
  if($("pnav"))$("pnav").onclick=function(){
    var tg={lat:draft.lat,lng:draft.lng,name:draft.name||t("unnamed")},go=function(){closeSheet();startNav(tg)};
    if(isDirty())confirmDiscard("close",go);else go();
  };
  $("ps").onclick=function(){save()};
  if($("pd"))$("pd").onclick=del;
}
function closeSheet(keep){var s=$("sheet");if(s)s.remove();if(vplacing&&!keep)endVPlacing();if(!keep){draft=null;base=null;photoPin=null;if(user){$("bar").classList.remove("hide");render()}}layoutPanels()}
function replaceLocal(oldId,saved){
  var found=false;
  pins=pins.map(function(p){if(p.id===oldId){found=true;return saved}return p});
  if(!found)pins.push(saved);
}
function save(opts){
  collectForm();
  if(!draft.name)return toast(t("nameReq"));
  if(hasFloors(draft)&&firstUnnamedShop())return toast(t("shopNameReq"));
  applyDerived(draft);
  var d=draft,body=pinBody(d),stay=!!(opts&&opts.stay);
  var offline=function(){enqueue(d);var local=JSON.parse(JSON.stringify(d));local._pending=true;local.team=local.team||user.team;local.by=local.by||user.id;
    replaceLocal(d.id,local);
    if(stay){base=fieldsOf(d);render();renderNet();toast(t("queued"),3500)}else{closeSheet();renderNet();toast(t("queued"),3500)}};
  if(isTmp(d.id))return offline();               // まだ送信されていないピンの編集
  var req=d.id?api("PUT","/api/pins/"+d.id,body):api("POST","/api/pins",body);
  req.then(function(saved){
    replaceLocal(d.id||saved.id,saved);
    if(stay){d.t=saved.t;d.updatedBy=saved.updatedBy;base=fieldsOf(d);render();toast(t("saved"))}
    else{closeSheet();toast(t("saved"))}
  },function(e){
    if(e&&e._net){online=false;return offline()}
    toast(t("saveFail"));
  });
}
function del(){
  var d=draft;
  if(isTmp(d.id)){setQueue(queue().filter(function(e){return e.tmp!==d.id}));pins=pins.filter(function(p){return p.id!==d.id});closeSheet();renderNet();toast(t("deleted"));return}
  api("DELETE","/api/pins/"+d.id).then(function(){
    setQueue(queue().filter(function(e){return e.id!==d.id}));
    pins=pins.filter(function(p){return p.id!==d.id});closeSheet();renderNet();toast(t("deleted"));
  },function(e){toast(e&&e._status===403?t("delForbidden"):e&&e._net?t("delOffline"):t("delFail"))});
}
/* ---------- 要救助者（INSARAGの「V」マーク） ---------- */
// status: 0=要救助者の可能性(V) / 1=生存確認(L) / 2=死亡確認(D) / 3=救出・搬出済み
var V_COL=["var(--st0)","var(--st0)","var(--ink)","var(--st2)"],V_TXT=["V","L","D","V"];
var victimLayer=L.layerGroup().addTo(map);
function vGlyph(st,r){
  st=V_COL[st]?st:0;var col=V_COL[st];
  return '<circle r="'+r+'" fill="var(--panel)" stroke="'+col+'" stroke-width="2.5"'+(st===0?' stroke-dasharray="4 2"':'')+'/>'+
    '<text y="'+(r*0.45).toFixed(1)+'" text-anchor="middle" font-size="'+(r*1.3).toFixed(1)+'" style="fill:'+col+';stroke:none;font-family:\'Share Tech Mono\',monospace;font-weight:700">'+V_TXT[st]+'</text>'+
    (st===3?'<line x1="'+(-r*0.75)+'" y1="'+(r*0.75)+'" x2="'+(r*0.75)+'" y2="'+(-r*0.75)+'" stroke="'+col+'" stroke-width="2.5"/>':'');
}
function vIconSVG(st,r){var w=2*r+6;return '<svg width="'+w+'" height="'+w+'" viewBox="'+(-w/2)+' '+(-w/2)+' '+w+' '+w+'">'+vGlyph(st,r)+'</svg>'}
function vLabel(v){return t("vs"+v.status)+(v.floor?" · "+v.floor:"")+(v.note?" · "+v.note:"")}
function renderVictims(){
  victimLayer.clearLayers();
  if(!user)return;
  var ids={};onMap().forEach(function(p){ids[p.id]=1});
  victims.forEach(function(v){
    if(!ids[v.pinId])return;   // 絞り込みで隠れている建物のVは出さない
    var m=L.marker([v.lat,v.lng],{zIndexOffset:1500,title:vLabel(v),
      icon:L.divIcon({html:vIconSVG(+v.status,11),className:"pin-ic",iconSize:[28,28],iconAnchor:[14,14]})});
    m.on("click",function(e){if(vplacing){placeVictimAt(e.latlng);return}openVictim(JSON.parse(JSON.stringify(v)))});
    victimLayer.addLayer(m);
  });
}
function canAttach(d){return d&&typeof d.id==="number"}
function renderVictimList(){
  var el=$("vsec");if(!el||!draft)return;
  if(!canAttach(draft)){el.innerHTML='<div class="sec-h"><b>'+esc(t("victims"))+' / '+esc(t("photos"))+'</b></div><div class="sec-empty">'+esc(t("vSaveFirst"))+'</div>';return}
  var list=victims.filter(function(v){return v.pinId===draft.id});
  el.innerHTML='<div class="sec-h"><b>'+esc(t("victims"))+' <span class="mono">'+list.length+'</span></b><button type="button" id="vadd">'+esc(t("vAdd"))+'</button></div>'+
    (list.length?list.map(function(v){return '<button type="button" class="vrow" data-vid="'+v.id+'">'+vIconSVG(+v.status,10)+'<span>'+esc(vLabel(v))+'</span><small class="mono">'+esc(fmtTime(v.t))+'</small></button>'}).join(""):
      '<div class="sec-empty">'+esc(t("vNone"))+'</div>');
  $("vadd").onclick=function(){openVictim({pinId:draft.id,lat:draft.lat,lng:draft.lng,floor:draft.floor||"",status:0,note:""})};
  Array.prototype.forEach.call(el.querySelectorAll("[data-vid]"),function(b){
    b.onclick=function(){var v=victims.filter(function(x){return String(x.id)===b.getAttribute("data-vid")})[0];if(v)openVictim(JSON.parse(JSON.stringify(v)))};
  });
}
function closeVictim(){var el=$("vm");if(el)el.remove()}
function openVictim(v){
  closeVictim();
  var isNew=!v.id,own=user&&v.team===user.team;
  var el=document.createElement("div");el.className="modal vm";el.id="vm";
  var seg=function(cls,items,cur,attr){return '<div class="seg '+cls+'">'+items.map(function(x){return '<button type="button" '+attr+'="'+x[0]+'"'+(String(cur)===String(x[0])?' class="on"':'')+'>'+esc(x[1])+'</button>'}).join("")+'</div>'};
  var meta=isNew?"":'<div class="meta">'+esc(t("created"))+': '+esc((v.team||"")+" / "+(v.by||""))+(v.t?'<br>'+esc(t("updated"))+': '+esc((v.updatedBy||v.by||"")+" · "+fmtTime(v.t)):"")+'</div>';
  el.innerHTML='<div class="box" role="dialog" aria-modal="true" aria-labelledby="vmT"><h1 id="vmT">'+esc(isNew?t("vNew"):t("vEdit"))+'</h1>'+
    '<div class="co mono" id="vmCo"></div>'+meta+
    '<label>'+esc(t("vPlace"))+'</label>'+seg("vloc",[["pin",t("vAtPin")],["gps",t("vAtGps")],["map",t("vAtMap")]],"","data-loc")+
    '<label>'+esc(t("status"))+'</label>'+seg("vst",[[0,t("vs0")],[1,t("vs1")],[2,t("vs2")],[3,t("vs3")]],v.status,"data-vs")+
    '<label for="vmF">'+esc(t("floor"))+'</label><input id="vmF" placeholder="'+esc(t("floorPh"))+'">'+
    '<label for="vmN">'+esc(t("note"))+'</label><textarea id="vmN" rows="2" placeholder="'+esc(t("vNotePh"))+'"></textarea>'+
    (v.id?'<div class="mrow"><button type="button" id="vmNav">'+esc(t("navGo"))+'</button></div>':'')+
    '<div class="mrow"><button type="button" id="vmC">'+esc(t("cancel"))+'</button><button type="button" class="solid" id="vmS">'+esc(t("save"))+'</button></div>'+
    (!isNew&&(own||isHQ())?'<div class="mrow"><button type="button" class="del" id="vmD">'+esc(t("del"))+'</button></div>':'')+'</div>';
  document.body.appendChild(el);
  $("vmF").value=v.floor||"";$("vmN").value=v.note||"";
  var showCo=function(){$("vmCo").textContent=(+v.lat).toFixed(5)+", "+(+v.lng).toFixed(5)};showCo();
  var collect=function(){v.floor=$("vmF").value.trim();v.note=$("vmN").value.trim()};
  var onKey=function(e){if(e.key==="Escape"){e.preventDefault();done()}};
  var done=function(){document.removeEventListener("keydown",onKey);closeVictim()};
  document.addEventListener("keydown",onKey);
  el.addEventListener("click",function(e){
    if(e.target===el){done();return}
    var b=e.target.closest("button");if(!b)return;
    if(b.hasAttribute("data-vs")){v.status=+b.getAttribute("data-vs");Array.prototype.forEach.call(b.parentNode.children,function(x){x.classList.toggle("on",x===b)});return}
    var loc=b.getAttribute("data-loc");
    if(loc==="pin"){var p=pins.filter(function(x){return x.id===v.pinId})[0];if(p){v.lat=p.lat;v.lng=p.lng;showCo()}}
    else if(loc==="gps"){getPos().then(function(g){v.lat=g.lat;v.lng=g.lng;if($("vm"))showCo()},function(){toast(t("gpsFail"))})}
    else if(loc==="map"){collect();done();startVPlacing(v)}
  });
  $("vmC").onclick=done;
  if($("vmNav"))$("vmNav").onclick=function(){done();startNav({lat:v.lat,lng:v.lng,name:vLabel(v)})};
  $("vmS").onclick=function(){
    collect();
    var body={lat:v.lat,lng:v.lng,floor:v.floor,status:v.status,note:v.note};
    var req=v.id?api("PUT","/api/victims/"+v.id,body):api("POST","/api/pins/"+v.pinId+"/victims",body);
    $("vmS").disabled=true;
    req.then(function(saved){
      var found=false;victims=victims.map(function(x){if(x.id===saved.id){found=true;return saved}return x});
      if(!found)victims.push(saved);
      done();renderVictims();renderVictimList();toast(t("saved"));
    },function(e){if($("vmS"))$("vmS").disabled=false;toast(e&&e._net?t("offlineNoSave"):t("saveFail"))});
  };
  if($("vmD"))$("vmD").onclick=function(){
    api("DELETE","/api/victims/"+v.id).then(function(){
      victims=victims.filter(function(x){return x.id!==v.id});done();renderVictims();renderVictimList();toast(t("deleted"));
    },function(e){toast(e&&e._status===403?t("delOther"):e&&e._net?t("offlineNoSave"):t("delFail"))});
  };
  $("vmS").focus();
}
// 地図でVの位置を指定：編集画面は一時的に隠し、タップした地点で入力画面に戻る
function startVPlacing(v){
  vplacing=v;setPlacing(false);
  var sh=$("sheet");if(sh)sh.classList.add("hide");
  $("hint").textContent=t("vTapMap");$("hint").classList.remove("hide");
}
function endVPlacing(){
  vplacing=null;$("hint").textContent=t("tapMap");$("hint").classList.toggle("hide",!placing);
  var sh=$("sheet");if(sh)sh.classList.remove("hide");
}
function placeVictimAt(ll){var v=vplacing;endVPlacing();ll=wrapLL(ll);v.lat=ll.lat;v.lng=ll.lng;openVictim(v)}

/* ---------- 建物の写真 ---------- */
var PHOTO_MAX=1024*1024;
function authHdr(){return user&&user.token?{Authorization:"Bearer "+user.token}:{}}
function photoURL(id){
  if(photoURLs[id])return Promise.resolve(photoURLs[id]);
  return fetch("/api/photos/"+id,{headers:authHdr()}).then(function(r){if(!r.ok)throw r;return r.blob()})
    .then(function(b){return(photoURLs[id]=URL.createObjectURL(b))});
}
// 端末側で長辺1600pxに縮小し、JPEGで約0.9MB以下にしてから送る（通信量とDBの容量を節約）
function shrink(file){return new Promise(function(res,rej){
  var url=URL.createObjectURL(file),img=new Image();
  img.onload=function(){
    var M=1600,w=img.naturalWidth,h=img.naturalHeight,k=Math.min(1,M/Math.max(w,h));
    var cv=document.createElement("canvas");cv.width=Math.max(1,Math.round(w*k));cv.height=Math.max(1,Math.round(h*k));
    cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height);URL.revokeObjectURL(url);
    var qs=[0.8,0.65,0.5],i=0;
    (function next(){cv.toBlob(function(b){if(!b)return rej();if(b.size<=900*1024||i>=qs.length-1)res(b);else{i++;next()}},"image/jpeg",qs[i])})();
  };
  img.onerror=function(){URL.revokeObjectURL(url);rej()};
  img.src=url;
})}
var curPhotos=[],photoPin=null,uploading={};   // uploading: 送信中の枚数（キー＝階のラベル、建物全体は ""）
function renderPhotos(d){
  var el=$("phsec");if(!el)return;
  if(!canAttach(d)){el.classList.add("hide");el.innerHTML="";return}
  el.classList.remove("hide");
  if(photoPin!==d.id){photoPin=d.id;curPhotos=[];
    api("GET","/api/pins/"+d.id+"/photos").then(function(list){if(photoPin===d.id){curPhotos=list;drawPhotos()}},function(){});
  }
  el.innerHTML='<div class="sec-h"><b>'+esc(t("photos"))+' <span class="mono" id="phN"></span></b><button type="button" id="phAdd">'+esc(t("phAdd"))+'</button></div>'+
    '<input type="file" id="phIn" accept="image/*" multiple class="hide"><div class="photos" id="phList"></div>';
  $("phAdd").onclick=function(){$("phIn").click()};
  $("phIn").onchange=function(){var fs=Array.prototype.slice.call(this.files||[]);this.value="";fs.forEach(function(f){upload(d.id,f)})};
  drawPhotos();
}
function floorLabels(){return hasFloors(draft)?draft.floors.map(function(f){return f.label}):[]}
// 建物全体の写真欄：階のない写真と、削除された階の写真（見えなくならないように）
function bldPhotos(){var ls=floorLabels();return curPhotos.filter(function(ph){return !ph.floor||ls.indexOf(ph.floor)<0})}
function fillPhotos(el,list,key){
  var up=uploading[key]||0;
  el.innerHTML=list.map(function(ph){return '<button type="button" data-ph="'+ph.id+'" aria-label="'+esc(t("photos")+" "+(ph.floor?ph.floor+" ":"")+fmtTime(ph.t))+'"></button>'}).join("")+
    (up?'<button type="button" class="up" disabled>'+esc(t("phUploading"))+'</button>':'')+
    (!list.length&&!up?'<div class="sec-empty">'+esc(t("phNone"))+'</div>':'');
  list.forEach(function(ph){
    var b=el.querySelector('[data-ph="'+ph.id+'"]');
    photoURL(ph.id).then(function(u){if(b.isConnected){var im=new Image();im.alt="";im.src=u;b.appendChild(im)}},function(){b.textContent="!"});
    b.onclick=function(){openPhoto(ph)};
  });
}
function drawPhotos(){
  var el=$("phList");
  if(el){var bl=bldPhotos();$("phN").textContent=bl.length;fillPhotos(el,bl,"")}
  drawFloorPhotos();
}
// 各階のタブの中の写真欄
function drawFloorPhotos(){
  $$("#flbox [data-fph]").forEach(function(box){
    var f=draft&&draft.floors&&draft.floors[+box.getAttribute("data-fph")];if(!f)return;
    if(!canAttach(draft)){box.innerHTML='<div class="sec-empty">'+esc(t("floorPhSave"))+'</div>';return}
    var list=curPhotos.filter(function(ph){return ph.floor===f.label});
    box.innerHTML='<div class="sec-h"><b>'+esc(t("floorPhotos"))+' <span class="mono">'+list.length+'</span></b><button type="button" data-phadd="1">'+esc(t("phAdd"))+'</button></div>'+
      '<input type="file" accept="image/*" multiple class="hide" data-phin="1"><div class="photos"></div>';
    var inp=box.querySelector("[data-phin]"),pid=draft.id,label=f.label;
    box.querySelector("[data-phadd]").onclick=function(){inp.click()};
    inp.onchange=function(){var fs=Array.prototype.slice.call(this.files||[]);this.value="";fs.forEach(function(x){upload(pid,x,label)})};
    fillPhotos(box.querySelector(".photos"),list,label);
  });
}
function upload(pinId,file,floor){
  var key=floor||"";uploading[key]=(uploading[key]||0)+1;drawPhotos();
  shrink(file).then(function(blob){
    if(blob.size>PHOTO_MAX)throw{tooBig:true};
    return fetch("/api/pins/"+pinId+"/photos"+(floor?"?floor="+encodeURIComponent(floor):""),{method:"POST",headers:Object.assign({"Content-Type":"image/jpeg"},authHdr()),body:blob})
      .then(function(r){return r.json()["catch"](function(){return{}}).then(function(j){if(!r.ok)throw j;photoURLs[j.id]=URL.createObjectURL(blob);return j})},
        function(){throw{_net:true}});
  }).then(function(ph){
    if(photoPin===pinId)curPhotos.push(ph);
  },function(e){toast(e&&e.tooBig||e&&e.error==="too_large"?t("phTooBig"):e&&e._net?t("offlineNoSave"):t("phFail"))})
  .then(function(){uploading[key]--;drawPhotos()});
}
function closePhoto(){var el=$("pv");if(el)el.remove()}
function openPhoto(ph){
  closePhoto();
  var el=document.createElement("div");el.className="pv";el.id="pv";el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");
  var own=user&&ph.team===user.team;
  el.innerHTML='<img alt=""><div class="pv-bar"><span>'+esc((ph.floor?ph.floor+" · ":"")+(ph.team||"")+" / "+(ph.by||"")+" · "+fmtTime(ph.t))+'</span>'+
    (own||isHQ()?'<button type="button" class="del" id="pvD">'+esc(t("del"))+'</button>':'')+'<button type="button" id="pvX">'+esc(t("close"))+'</button></div>';
  document.body.appendChild(el);
  photoURL(ph.id).then(function(u){el.querySelector("img").src=u},function(){toast(t("phLoadFail"))});
  var onKey=function(e){if(e.key==="Escape"){e.preventDefault();done()}};
  var done=function(){document.removeEventListener("keydown",onKey);closePhoto()};
  document.addEventListener("keydown",onKey);
  $("pvX").onclick=done;$("pvX").focus();
  if($("pvD"))$("pvD").onclick=function(){
    api("DELETE","/api/photos/"+ph.id).then(function(){
      curPhotos=curPhotos.filter(function(x){return x.id!==ph.id});done();drawPhotos();toast(t("deleted"));
    },function(e){toast(e&&e._status===403?t("delOther"):e&&e._net?t("offlineNoSave"):t("delFail"))});
  };
}

/* ---------- 隊の管理（本部のみ）：隊の作成・招待コード・隊員の削除 ---------- */
function fmtCode(c){return String(c||"").replace(/(.{4})(?=.)/g,"$1-")}
function copyText(txt){
  return new Promise(function(res,rej){
    try{if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(txt).then(res,fallback)}catch(e){}
    fallback();
    function fallback(){try{var ta=document.createElement("textarea");ta.value=txt;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();
      var ok=document.execCommand("copy");ta.remove();ok?res():rej()}catch(e){rej()}}
  });
}
function closeAdmin(){var el=$("adm");if(el)el.remove()}
var admData=null;
function admMsg(m,ok){var el=$("admMsg");if(el){el.textContent=m||"";el.classList.toggle("ok",!!ok)}}
function openAdmin(){
  if(!isHQ())return;
  closeAdmin();
  var el=document.createElement("div");el.className="modal adm";el.id="adm";
  el.innerHTML='<div class="box" role="dialog" aria-modal="true" aria-labelledby="admT"><h1 id="admT">'+esc(t("admTitle"))+'</h1>'+
    '<p class="sec-empty" style="margin-top:0">'+esc(t("admHelp"))+'</p>'+
    '<form class="adm-new" id="admNew"><input id="admName" maxlength="30" placeholder="'+esc(t("newTeamPh"))+'" aria-label="'+esc(t("newTeamPh"))+'"><button class="solid" type="submit">'+esc(t("create"))+'</button></form>'+
    '<div class="adm-msg" id="admMsg" role="status"></div><div id="admList"></div>'+
    '<div class="mrow"><button type="button" id="admX">'+esc(t("close"))+'</button></div></div>';
  document.body.appendChild(el);
  var onKey=function(e){if(e.key==="Escape"){e.preventDefault();done()}};
  var done=function(){document.removeEventListener("keydown",onKey);closeAdmin()};
  document.addEventListener("keydown",onKey);
  $("admX").onclick=done;
  el.addEventListener("click",function(e){if(e.target===el)done()});
  $("admNew").onsubmit=function(e){
    e.preventDefault();var name=$("admName").value.trim();if(!name)return admMsg(t("teamNameReq"));
    api("POST","/api/teams",{name:name}).then(function(tm){$("admName").value="";admMsg(t("teamCreated")+"："+tm.name+"（"+fmtCode(tm.code)+"）",true);loadAdmin()},
      function(e){admMsg(e&&e.error==="team_exists"?t("teamExists"):e&&e._net?t("offlineNoSave"):t("admFail"))});
  };
  $("admList").addEventListener("click",onAdmClick);
  loadAdmin();
  $("admName").focus();
}
function loadAdmin(){api("GET","/api/teams").then(function(d){admData=d;drawAdmin()},function(e){admMsg(e&&e._net?t("noServer"):t("admFail"))})}
function drawAdmin(){
  var el=$("admList");if(!el||!admData)return;
  var h=admData.teams.length?admData.teams.map(function(tm){
    return '<div class="tm'+(tm.active?'':' off')+'" data-tm="'+tm.id+'"><div class="tm-h"><b>'+esc(tm.name)+'</b>'+(tm.active?'':'<span class="tag">'+esc(t("tmDisabled"))+'</span>')+'</div>'+
      '<div class="tm-code">'+esc(fmtCode(tm.code))+'</div>'+
      '<div class="tm-acts"><button type="button" class="solid" data-a="copy">'+esc(t("copyInvite"))+'</button><button type="button" data-a="regen">'+esc(t("regen"))+'</button>'+
      '<button type="button" data-a="'+(tm.active?'off':'on')+'"'+(tm.active?' class="del"':'')+'>'+esc(t(tm.active?"tmDisable":"tmEnable"))+'</button></div>'+
      '<div class="tm-mem"><div><span>'+esc(t("membersN",{n:tm.members.length}))+'</span></div>'+
      (tm.members.length?tm.members.map(function(m){return '<div><span class="mono">'+esc(m.id)+' <small>'+esc(fmtTime(m.t))+'</small></span><button type="button" class="del" data-a="rm" data-u="'+esc(m.id)+'">'+esc(t("rmMember"))+'</button></div>'}).join(""):
        '<div><span class="sec-empty" style="margin:0">'+esc(t("noMembers"))+'</span></div>')+'</div></div>';
  }).join(""):'<div class="sec-empty">'+esc(t("tmNoTeams"))+'</div>';
  h+='<h2>'+esc(t("hqAccounts"))+'</h2><div class="tm-mem">'+admData.hq.map(function(u){return '<div><span class="mono">'+esc(u.id)+' <small>'+esc(u.team)+'</small></span></div>'}).join("")+'</div>';
  el.innerHTML=h;
}
var armed=null;   // 「もう一度押すと…」の確認待ちのボタン
function onAdmClick(e){
  var b=e.target.closest("button[data-a]");if(!b)return;
  var box=b.closest("[data-tm]"),tm=admData.teams.filter(function(x){return String(x.id)===box.getAttribute("data-tm")})[0];if(!tm)return;
  var a=b.getAttribute("data-a");
  var twice=function(msg,run){if(armed===b){armed=null;run()}else{armed=b;admMsg(msg);setTimeout(function(){if(armed===b)armed=null},4000)}};
  var fail=function(e){admMsg(e&&e._net?t("offlineNoSave"):t("admFail"))};
  if(a==="copy"){
    var url=location.origin+"/?invite="+tm.code;
    copyText(t("inviteMsg",{team:tm.name,url:url,code:fmtCode(tm.code)})).then(function(){admMsg(t("copiedInvite"),true)},function(){admMsg(t("admFail"))});
  }else if(a==="regen"){
    twice(t("regenConfirm"),function(){api("POST","/api/teams/"+tm.id+"/code").then(function(r){tm.code=r.code;drawAdmin();admMsg(t("regenDone")+"："+fmtCode(r.code),true)},fail)});
  }else if(a==="off"||a==="on"){
    api("PUT","/api/teams/"+tm.id,{active:a==="on"}).then(function(){tm.active=a==="on";drawAdmin();admMsg("",true)},fail);
  }else if(a==="rm"){
    var uid=b.getAttribute("data-u");
    twice(t("rmConfirm")+"："+uid,function(){api("DELETE","/api/users/"+encodeURIComponent(uid)).then(function(){tm.members=tm.members.filter(function(m){return m.id!==uid});drawAdmin();admMsg(t("deleted")+"："+uid,true)},fail)});
  }
}
$("admBtn").onclick=openAdmin;

/* ---------- 方位（コンパス） ----------
 * スマホの方位センサー。インターネットは不要。
 *  - iPhone：DeviceOrientationEvent.requestPermission() を「ボタンを押したとき」に呼ぶ必要がある → webkitCompassHeading
 *  - Android（Chrome）：deviceorientationabsolute の alpha（北から反時計回り）→ 360 - alpha
 * 画面の回転（横向き）の分も足す。値がぶれるので少しなめらかにする。
 */
var heading=null,hdgAt=0,gpsHdg=null,gpsHdgAt=0;
var compassListening=false,compassPerm=null;   // compassPerm：許可の状態（null=まだ聞いていない / "granted" / "denied" / "prompt" / "error"）
function hasHeading(){return heading!=null&&Date.now()-hdgAt<3000}
function curHeading(){ // コンパス → 無ければ移動方向（歩いているときのGPSの進行方向）
  if(hasHeading())return heading;
  if(gpsHdg!=null&&Date.now()-gpsHdgAt<10000)return gpsHdg;
  return null;
}
function screenAngle(){
  var a=screen.orientation&&typeof screen.orientation.angle==="number"?screen.orientation.angle:(typeof window.orientation==="number"?window.orientation:0);
  return a||0;
}
function onOrient(e){
  var h=null;
  if(typeof e.webkitCompassHeading==="number"&&!isNaN(e.webkitCompassHeading))h=e.webkitCompassHeading;
  else if((e.absolute===true||e.type==="deviceorientationabsolute")&&typeof e.alpha==="number")h=360-e.alpha;
  if(h==null)return;
  h=(h+screenAngle()+360)%360;
  if(heading==null||Date.now()-hdgAt>1000)heading=h;
  else{var df=((h-heading+540)%360)-180;heading=(heading+df*0.3+360)%360}
  hdgAt=Date.now();
  applyHeading();
}
// センサーの値を受け取る準備（許可がなければ値が来ないだけなので、先に登録しておいてよい）
function listenCompass(){
  if(compassListening||!window.DeviceOrientationEvent)return;
  if("ondeviceorientationabsolute" in window)window.addEventListener("deviceorientationabsolute",onOrient);
  window.addEventListener("deviceorientation",onOrient);   // iPhone（webkitCompassHeading）や absolute 非対応の端末
  compassListening=true;
}
// iPhone（と新しいChrome）は許可が必要。ボタンを押した処理の中で呼ぶこと（そうしないと許可の画面が出ない）
function enableCompass(){
  if(!window.DeviceOrientationEvent)return Promise.resolve(false);
  listenCompass();
  if(typeof DeviceOrientationEvent.requestPermission!=="function"){compassPerm="granted";return Promise.resolve(true)}
  if(compassPerm==="granted")return Promise.resolve(true);
  try{
    return DeviceOrientationEvent.requestPermission().then(function(st){compassPerm=st;return st!=="denied"},function(){compassPerm="error";return false});
  }catch(e){compassPerm="error";return Promise.resolve(false)}
}
// 「コンパス」ボタンを出すか：まだ向きが取れていなくて、許可を求め直す余地があるとき
function needCompassBtn(){
  return !hasHeading()&&!!window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==="function"&&compassPerm!=="granted"&&compassPerm!=="denied";
}
var hdgRaf=0,hadHeading=false;
function applyHeading(){ // 1フレームに1回だけ描き直す
  if(hdgRaf)return;
  hdgRaf=requestAnimationFrame(function(){
    hdgRaf=0;drawGpsHeading();
    var hh=curHeading()!=null;
    if(nav){if(hh!==hadHeading)drawNavBar();else drawNavArrow()}   // 向きが取れ始めた・取れなくなったときは説明文も更新
    hadHeading=hh;
  });
}

/* ---------- 現在地の印（精度の円・向き） ---------- */
var gpsAcc=null;
function showGps(p){
  if(!p)return;
  if(!gpsMarker){
    var icon=L.divIcon({className:"pin-ic gps-ic",iconSize:[64,64],iconAnchor:[32,32],
      html:'<svg width="64" height="64" viewBox="-32 -32 64 64" style="overflow:visible"><g class="gps-cone" style="display:none"><path d="M0,0 L-13,-29 A32,32 0 0 1 13,-29 Z" fill="var(--mark)" opacity=".28"/></g>'+
        '<circle r="9" fill="var(--panel)" stroke="var(--ink)" stroke-width="2.5"/><circle r="4" fill="var(--ink)"/></svg>'});
    gpsMarker=L.marker([p.lat,p.lng],{icon:icon,interactive:false,keyboard:false,zIndexOffset:2500}).addTo(map);
  }else gpsMarker.setLatLng([p.lat,p.lng]);
  if(typeof p.acc==="number"&&isFinite(p.acc)){
    if(!gpsAcc)gpsAcc=L.circle([p.lat,p.lng],{radius:p.acc,className:"gps-acc",interactive:false,weight:1}).addTo(map);
    else gpsAcc.setLatLng([p.lat,p.lng]).setRadius(p.acc);
  }
  drawGpsHeading();
}
function drawGpsHeading(){
  var el=gpsMarker&&gpsMarker.getElement();if(!el)return;
  var cone=el.querySelector(".gps-cone"),h=curHeading();
  if(!cone)return;
  if(h==null){cone.style.display="none";return}
  cone.style.display="";cone.setAttribute("transform","rotate("+h.toFixed(1)+")");
}

/* ---------- ナビ（目的地までの方向と距離。GPSと方位センサーだけで動くので、圏外でも使える） ---------- */
var nav=null,navWatch=null,navPos=null,navErr=null,navArrived=false,navFitted=false,wakeLock=null,navTick=null,navTgt=null;
var navLayer=L.layerGroup().addTo(map),navLine=null;
function navKey(){return "ss_nav_"+(user?user.id:"")}
function bearingDeg(a,b){
  var r=Math.PI/180,y=Math.sin((b.lng-a.lng)*r)*Math.cos(b.lat*r),
      x=Math.cos(a.lat*r)*Math.sin(b.lat*r)-Math.sin(a.lat*r)*Math.cos(b.lat*r)*Math.cos((b.lng-a.lng)*r);
  return(Math.atan2(y,x)/r+360)%360;
}
function dirName(deg){return t("dirs").split(",")[Math.round(deg/45)%8]}
function keepAwake(){ // ナビ中は画面を消さない（画面が消えるとブラウザがGPSを止めるため）
  if(!nav||wakeLock||!("wakeLock" in navigator)||document.hidden)return;
  navigator.wakeLock.request("screen").then(function(l){wakeLock=l;l.addEventListener("release",function(){wakeLock=null})},function(){});
}
function startNav(tg){
  if(!tg||!isFinite(+tg.lat)||!isFinite(+tg.lng))return;
  stopNav();
  nav={lat:+tg.lat,lng:+tg.lng,name:tg.name||""};
  if(tg.posId){nav.posId=tg.posId;nav.posT=tg.posT||null}   // 隊へのナビ：相手の位置が更新されたら目的地も動かす
  if(tg.pt)nav.pt=1;   // 地図上の地点（名前は住所が分かれば住所）
  nav.mode=tg.mode==="line"||tg.mode==="road"?tg.mode:(S.get(NAVMODE_KEY)==="line"?"line":"road");   // 道順／直線（前回の選択を使う）
  if(tg.route&&tg.route.coords&&tg.route.coords.length>1)nav.route=tg.route;   // 再開したとき：保存しておいた道順（圏外でも使える）
  routeBusy=false;routeAt=0;routeErr=null;routeSeq++;offFixes=0;lastOffT=0;routeProg=null;
  S.set(navKey(),nav);
  navArrived=false;navFitted=false;navErr=null;navTouched=0;
  if($("sheet")&&!isDirty())closeSheet();
  map.closePopup();
  enableCompass().then(function(){drawNavBar()});
  $("stage").classList.add("navon");
  var tgt=L.divIcon({className:"pin-ic",iconSize:[44,44],iconAnchor:[22,22],
    html:'<svg width="44" height="44" viewBox="-22 -22 44 44" style="overflow:visible"><circle class="pulse" r="12" fill="none" stroke="var(--mark)" stroke-width="3"/><circle r="17" fill="none" stroke="var(--mark)" stroke-width="2.5" stroke-dasharray="5 4"/><circle r="4" fill="var(--mark)"/></svg>'});
  navTgt=L.marker([nav.lat,nav.lng],{icon:tgt,interactive:false,keyboard:false,zIndexOffset:2400});
  navLayer.addLayer(navTgt);
  navLine=L.polyline([[nav.lat,nav.lng],[nav.lat,nav.lng]],{className:"nav-line",interactive:false,weight:4,dashArray:"10 8"});
  navLayer.addLayer(navLine);
  drawRoute();
  buildNavBar();
  if(navigator.geolocation){
    // 端末が最後に測った位置をすぐ使う（同じ場所に止まっていると、新しい測位がすぐには来ないことがあるため）
    navigator.geolocation.getCurrentPosition(function(p){if(nav&&(!navPos||fixTime(p)>navPos.t))setNavPos(p)},function(){},{enableHighAccuracy:false,maximumAge:120000,timeout:8000});
    navWatch=navigator.geolocation.watchPosition(setNavPos,function(e){navErr=e;updNav()},{enableHighAccuracy:true,maximumAge:3000,timeout:20000});
  }else navErr={code:2};
  clearInterval(navTick);navTick=setInterval(updNav,5000);   // 「GPSの更新なし」の表示を進める
  keepAwake();
  if(gps&&!navPos)navPos={lat:gps.lat,lng:gps.lng,acc:null,t:Date.now()-60000};   // 最初の測位までは直前の位置で仮表示
  updNav();
  if(!navFitted&&!navVisible().contains(L.latLng(nav.lat,nav.lng)))fitNav(true);   // 目的地が画面外（再開したときなど）なら見える位置へ
}
function fixTime(p){ // 測位した時刻（おかしな値なら今の時刻）
  var ts=+p.timestamp;return ts>946684800000&&ts<Date.now()+60000?ts:Date.now();
}
function setNavPos(p){
  if(!nav)return;
  var c=p.coords;
  navPos={lat:c.latitude,lng:c.longitude,acc:c.accuracy,t:fixTime(p)};navErr=null;
  if(typeof c.heading==="number"&&!isNaN(c.heading)&&c.speed>0.8){gpsHdg=c.heading;gpsHdgAt=Date.now()}
  gps={lat:navPos.lat,lng:navPos.lng};showGps(navPos);updNav();
}
function stopNav(){
  if(navWatch!=null&&navigator.geolocation)navigator.geolocation.clearWatch(navWatch);
  navWatch=null;clearInterval(navTick);navTick=null;
  navLayer.clearLayers();navLine=null;navTgt=null;navPos=null;
  routeLine=null;routeEnd=null;routeProg=null;routeSeq++;routeBusy=false;
  var el=$("nav");if(el)el.remove();
  $("stage").classList.remove("navon");
  if(wakeLock){try{wakeLock.release()}catch(e){}wakeLock=null}
  if(nav&&user)S.set(navKey(),null);
  nav=null;
}
function resumeNav(){var n=S.get(navKey());if(n&&n.lat!=null)startNav(n)}
function buildNavBar(){
  var old=$("nav");if(old)old.remove();
  var el=document.createElement("div");el.className="navbar";el.id="nav";el.setAttribute("role","region");el.setAttribute("aria-label",t("navGo"));
  el.innerHTML='<div class="nav-arrow" id="navArr" aria-hidden="true"><svg width="64" height="64" viewBox="-32 -32 64 64"><g id="navArrG">'+
      '<path d="M0,-27 L17,15 L0,6 L-17,15 Z" fill="var(--mark)" stroke="var(--panel)" stroke-width="2" stroke-linejoin="round"/></g></svg></div>'+
    '<div class="nav-info" aria-live="polite"><small id="navTo"></small><b id="navD" class="mono"></b><span id="navDir"></span><span id="navSub"></span></div>'+
    '<div class="nav-btns"><button type="button" id="navCmp" class="hide">'+esc(t("navCompass"))+'</button><button type="button" id="navMode"></button><button type="button" id="navFit">'+esc(t("navFit"))+'</button>'+
    '<button type="button" id="navRoute">'+esc(t("navRoute"))+'</button><button type="button" class="del" id="navEnd">'+esc(t("navEnd"))+'</button></div>';
  $("stage").appendChild(el);
  $("navEnd").onclick=stopNav;
  $("navFit").onclick=function(){fitNav(true)};
  $("navMode").onclick=function(){   // 道順 ⇄ 直線（がれき・通行止めで道が使えないときは直線に）
    nav.mode=navMode()==="road"?"line":"road";S.set(NAVMODE_KEY,nav.mode);saveNav();
    routeErr=null;offFixes=0;routeAt=0;
    if(nav.mode==="road")drawRoute();else clearRoute();
    updNav();
  };
  $("navCmp").onclick=function(){enableCompass().then(function(ok){if(!ok)toast(t("navCompassNo"),3000);drawNavBar()})};
  $("navRoute").onclick=function(){ // 道路の経路は地図アプリに任せる（ネット接続、またはアプリ側のオフライン地図が必要）
    window.open("https://www.google.com/maps/dir/?api=1&destination="+nav.lat.toFixed(6)+","+nav.lng.toFixed(6)+"&travelmode=walking","_blank","noopener");
  };
  drawNavBar();
}
// 地図のうち、上のパネル・右のボタン・下のナビ表示に隠れていない部分（px）
function navPads(){
  var s=map.getSize(),bar=$("nav"),tl=$$(".tl")[0],
      p={l:40,r:70,top:tl?tl.offsetTop+tl.offsetHeight+16:80,bottom:bar?bar.offsetHeight+40:40};
  if(s.y-p.top-p.bottom<80||s.x-p.l-p.r<80)p={l:10,r:10,top:10,bottom:10};   // 画面が小さい（横向きなど）
  return p;
}
function navVisible(){
  var s=map.getSize(),p=navPads();
  return L.latLngBounds(map.containerPointToLatLng([p.l,p.top]),map.containerPointToLatLng([s.x-p.r,s.y-p.bottom]));
}
function fitNav(force){
  if(!nav)return;
  var pts=[[nav.lat,nav.lng]];if(navPos)pts.push([navPos.lat,navPos.lng]);
  var p=navPads(),b=L.latLngBounds(pts);
  if(routeLine&&useRoute())b.extend(routeLine.getBounds());
  if(force||!navVisible().contains(b))
    map.fitBounds(b,{paddingTopLeft:[p.l,p.top],paddingBottomRight:[p.r,p.bottom],maxZoom:pts.length===1?Math.max(map.getZoom(),17):18});
}
// 自分が見える範囲から出たら、地図を少し動かして追いかける（地図を触った直後の20秒は動かさない）
var navTouched=0;
function navFollow(){
  if(!nav||!navPos||!navFitted||Date.now()-navTouched<20000||Date.now()-navPos.t>30000)return;
  var me=L.latLng(navPos.lat,navPos.lng);
  if(navVisible().contains(me))return;
  var p=navPads(),s=map.getSize(),pt=map.latLngToContainerPoint(me);   // 自分が見える部分のまん中に来るように動かす
  map.panBy([pt.x-(p.l+s.x-p.r)/2,pt.y-(p.top+s.y-p.bottom)/2]);
}
function navTouch(){navTouched=Date.now()}   // 地図を動かした・拡大縮小した（ボタンやピンを押しただけでは数えない）
map.on("dragstart dblclick",navTouch);
map.getContainer().addEventListener("wheel",navTouch,{passive:true});
map.getContainer().addEventListener("touchstart",function(e){if(e.touches&&e.touches.length>1)navTouch()},{passive:true});
$("zi").addEventListener("click",navTouch);$("zo").addEventListener("click",navTouch);
function drawNavArrow(){
  var g=$("navArrG");if(!g||!nav||!navPos)return;
  var br=bearingDeg(navPos,navAim()),h=curHeading(),rot=h==null?br:br-h;
  g.setAttribute("transform","rotate("+(((rot%360)+360)%360).toFixed(1)+")");
  $("navArr").classList.toggle("fixed",h==null);
}
function drawNavBar(){
  if(!$("nav")||!nav)return;
  $("navTo").textContent=t("navTo",{name:nav.name||t(nav.pt?"navPoint":"unnamed")});
  var h=curHeading();
  $("navCmp").classList.toggle("hide",!needCompassBtn());
  var mb=$("navMode");mb.textContent=t(navMode()==="road"?"navModeOn":"navModeOff");mb.classList.toggle("on",navMode()==="road");mb.setAttribute("aria-pressed",navMode()==="road");
  if(!navPos){
    $("navD").textContent="—";$("navDir").textContent=navErr&&navErr.code===1?t("navGpsDenied"):t("navWaiting");$("navSub").textContent="";
    $("navArr").classList.add("wait");return;
  }
  $("navArr").classList.remove("wait");
  var road=useRoute()&&routeProg,off=road&&routeProg.off>offLim();
  var d=road?routeRemain():distM(navPos,nav),br=bearingDeg(navPos,nav),mins=Math.max(1,Math.ceil(d/70));
  $("navD").textContent=fmtDist(d);
  var dir;
  if(navArrived)dir=t("navArrived");
  else if(road){var nt=nextTurn();dir=nt?(nt.d<=20?t("navNow",{turn:nt.txt}):t("navNext",{d:fmtDist(nt.d),turn:nt.txt})):t("navAlong")}
  else dir=t("navDir",{dir:dirName(br),min:mins});
  $("navDir").textContent=dir;
  var age=Math.round((Date.now()-navPos.t)/1000);
  var sub=[],tAge=nav.posId&&nav.posT?nowS()-nav.posT:0;
  if(navMode()==="road"){
    if(road){sub.push(t("routeInfo",{min:mins}));if(off)sub.push(t(routeBusy?"routeRe":"routeOff"))}
    else sub.push(t(routeBusy||!routeErr?"routeLoading":routeErr.key));
  }
  if(tAge)sub.push(t("navTeamAge",{age:fmtAge(tAge)}));   // 隊へのナビ：相手の位置がいつのものか
  if(navPos.acc!=null)sub.push(t("navAcc",{m:Math.round(navPos.acc)}));
  if(age>30)sub.push(t("navStale",{s:age}));
  sub.push(h==null?t("navNorthUp"):hasHeading()?t("navCompassOn"):t("navMoveDir"));
  $("navSub").textContent=sub.join(" · ");
  $("navSub").classList.toggle("warn",age>30||(navPos.acc||0)>50||tAge>=AGE_OLD||!!off);
  $("nav").classList.toggle("arrived",navArrived);
  drawNavArrow();
}
function updNav(){
  if(!nav)return;
  if(navPos){
    routeProg=useRoute()?projRoute(navPos):null;
    updNavLines();
    routeCheck();
    var d=distM(navPos,nav);
    // 到着：15m以内（GPSの誤差が大きいときは、その分だけ広く。最大40m）
    if(!navArrived&&Date.now()-navPos.t<30000&&d<=Math.max(15,Math.min(navPos.acc||0,40))){
      navArrived=true;toast(t("navArrived"),4000);
      try{if(navigator.vibrate)navigator.vibrate([200,100,200,100,400])}catch(e){}
    }
    if(!navFitted&&Date.now()-navPos.t<30000){navFitted=true;fitNav(false)}else navFollow();
  }
  drawNavBar();
}
document.addEventListener("visibilitychange",function(){if(!document.hidden)keepAwake()});

/* ---------- 道順（道路に沿ったナビ。v2.10） ----------
 * ナビを始めると、サーバー経由で徒歩の道順を取得する（OpenStreetMap の道路データ・FOSSGIS の OSRM サーバー）。
 * 道順はナビと一緒に端末に保存 → 圏外になっても、道に沿った残りの距離・次の曲がり角・矢印はそのまま使える。
 * 道から外れたら、ネットにつながっていれば道順を取り直す（20秒に1回まで）。圏外なら「道から外れています」と表示し、矢印は道に戻る方向を指す。
 * 道順が取れないとき（圏外で始めた・道が見つからない）は、これまで通り直線で案内する。
 * 注意：道路のデータは平常時のもの。がれき・通行止めは分からないので、通れないときは「道順：OFF」で直線に切り替える。
 */
var NAVMODE_KEY="ss_navmode",ROUTE_RETRY_MS=20000,ROUTE_AHEAD_M=25;
var routeLine=null,routeEnd=null,routeBusy=false,routeAt=0,routeErr=null,routeSeq=0,offFixes=0,lastOffT=0,routeProg=null;
function navMode(){return nav&&nav.mode==="line"?"line":"road"}
function useRoute(){return !!(nav&&navMode()==="road"&&nav.route&&nav.route.coords&&nav.route.coords.length>1)}
function saveNav(){if(nav&&user)S.set(navKey(),nav)}
function offLim(){return Math.max(35,Math.min(navPos&&navPos.acc||0,60))}   // これ以上離れたら「道から外れた」（GPSの誤差の分だけ広く）
// 下準備：始点から各点までの距離（m）と、各曲がり角の位置
function prepRoute(r){
  var c=r.coords,cum=[0];
  for(var i=1;i<c.length;i++)cum.push(cum[i-1]+distM({lat:c[i-1][0],lng:c[i-1][1]},{lat:c[i][0],lng:c[i][1]}));
  r._cum=cum;r._len=cum[cum.length-1];
  var j=0;
  (r.steps||[]).forEach(function(st){   // 曲がり角は道順の点のどれか → 前から順に、一番近い点を探す
    var best=1e18,bi=j;
    for(var k=j;k<c.length;k++){var dd=Math.abs(c[k][0]-st.lat)+Math.abs(c[k][1]-st.lng);if(dd<best){best=dd;bi=k}if(dd<1e-7)break}
    st._at=cum[bi];j=bi;
  });
  return r;
}
// 現在地から道順への一番近い点（道順の始点からの距離 along・道からの距離 off）
function projRoute(p){
  var r=nav.route;if(!r._cum)prepRoute(r);
  var c=r.coords,kx=111320*Math.cos(p.lat*Math.PI/180),ky=110540,best=null;
  for(var i=0;i<c.length-1;i++){
    var ax=(c[i][1]-p.lng)*kx,ay=(c[i][0]-p.lat)*ky,dx=(c[i+1][1]-c[i][1])*kx,dy=(c[i+1][0]-c[i][0])*ky,
        l2=dx*dx+dy*dy,u=l2?Math.max(0,Math.min(1,-(ax*dx+ay*dy)/l2)):0,x=ax+u*dx,y=ay+u*dy,d=Math.sqrt(x*x+y*y);
    if(!best||d<best.off)best={off:d,i:i,u:u};
  }
  best.along=r._cum[best.i]+best.u*(r._cum[best.i+1]-r._cum[best.i]);
  best.lat=c[best.i][0]+best.u*(c[best.i+1][0]-c[best.i][0]);best.lng=c[best.i][1]+best.u*(c[best.i+1][1]-c[best.i][1]);
  return best;
}
function routePointAt(a){   // 始点から a m 進んだ点
  var r=nav.route,c=r.coords,cum=r._cum,i=0;
  while(i<cum.length-2&&cum[i+1]<a)i++;
  var seg=cum[i+1]-cum[i],u=seg?Math.max(0,Math.min(1,(a-cum[i])/seg)):0;
  return{lat:c[i][0]+u*(c[i+1][0]-c[i][0]),lng:c[i][1]+u*(c[i+1][1]-c[i][1])};
}
function routeLast(){var c=nav.route.coords;return{lat:c[c.length-1][0],lng:c[c.length-1][1]}}
// 矢印が指す点：道順のときは、道に沿って25m先（道から外れていれば、道に戻りながら進む方向になる）。終点の近くでは目的地そのもの
function navAim(){
  if(!useRoute()||!routeProg||routeProg.along+ROUTE_AHEAD_M>=nav.route._len)return nav;
  return routePointAt(routeProg.along+ROUTE_AHEAD_M);
}
function routeRemain(){return Math.max(0,nav.route._len-routeProg.along)+distM(routeLast(),nav)}   // 道に沿った残り＋終点から目的地まで
var TURN_KEY={"left":"turnL","right":"turnR","slight left":"turnSL","slight right":"turnSR","sharp left":"turnHL","sharp right":"turnHR","uturn":"turnU"};
function nextTurn(){   // 次の曲がり角（まっすぐ・道の名前が変わるだけの所は案内しない）
  var st=nav.route.steps||[],a=routeProg.along;
  for(var k=0;k<st.length;k++){
    var s=st[k];if(s.type==="depart"||s._at<=a+3)continue;
    if(s.type==="arrive")return null;
    if((s.type==="new name"||s.type==="continue"||s.type==="notification")&&/^(slight|straight|$)/.test(s.mod||""))continue;
    var key=/roundabout|rotary/.test(s.type)?"turnRb":TURN_KEY[s.mod];
    if(!key)continue;
    return{d:s._at-a,txt:t(key)+(s.name?t("navOnto",{name:s.name}):"")};
  }
  return null;
}
function clearRoute(){
  if(routeLine){navLayer.removeLayer(routeLine);routeLine=null}
  if(routeEnd){navLayer.removeLayer(routeEnd);routeEnd=null}
  routeProg=null;
}
function drawRoute(){
  clearRoute();
  if(!useRoute())return;
  var r=prepRoute(nav.route),c=r.coords,last=c[c.length-1];
  routeLine=L.polyline(c,{className:"nav-route",weight:6,interactive:false,attribution:t("routeAttr")});   // 出典の表示は利用規約で必要
  navLayer.addLayer(routeLine);
  if(distM({lat:last[0],lng:last[1]},nav)>8){   // 道の終わりから目的地までは点線
    routeEnd=L.polyline([last,[nav.lat,nav.lng]],{className:"nav-line",weight:3,dashArray:"4 6",interactive:false});
    navLayer.addLayer(routeEnd);
  }
}
// 現在地からの点線：道順のときは「道から離れているときだけ、道まで」。直線のときは目的地まで
function updNavLines(){
  if(!navLine||!navPos)return;
  if(useRoute()&&routeProg)navLine.setLatLngs(routeProg.off>8?[[navPos.lat,navPos.lng],[routeProg.lat,routeProg.lng]]:[]);
  else navLine.setLatLngs([[navPos.lat,navPos.lng],[nav.lat,nav.lng]]);
}
function navTargetKey(){return nav?nav.lat.toFixed(4)+","+nav.lng.toFixed(4):""}
function routeCheck(){
  if(navMode()!=="road"||!navPos)return;
  if(!useRoute()){requestRoute();return}
  if(Date.now()-navPos.t<30000&&navPos.t!==lastOffT){   // 新しい測位のたびに数える
    lastOffT=navPos.t;offFixes=routeProg&&routeProg.off>offLim()?offFixes+1:0;
  }
  var r=nav.route;
  if(offFixes>=2)requestRoute();   // 2回続けて道から外れた → 取り直す
  else if(r.to&&distM({lat:r.to[0],lng:r.to[1]},nav)>40)requestRoute();   // 目的地（隊）が動いた
}
function requestRoute(){
  if(!nav||!navPos||routeBusy||navMode()!=="road")return;
  if(routeErr&&routeErr.perm&&routeErr.tk===navTargetKey())return;   // この目的地は道が見つからない（何度聞いても同じ）
  if(Date.now()-routeAt<ROUTE_RETRY_MS)return;   // サーバーの利用規約のため、20秒に1回まで
  routeBusy=true;routeAt=Date.now();
  var seq=++routeSeq,to={lat:nav.lat,lng:nav.lng},first=!nav.route;
  api("GET","/api/route?from="+navPos.lat.toFixed(5)+","+navPos.lng.toFixed(5)+"&to="+to.lat.toFixed(5)+","+to.lng.toFixed(5)).then(function(r){
    routeBusy=false;if(seq!==routeSeq||!nav)return;   // その間にナビを終えた・目的地を変えた
    if(!r||!r.coords||r.coords.length<2){routeErr={key:"routeFail"};drawNavBar();return}
    delete r._status;r.to=[to.lat,to.lng];
    nav.route=r;routeErr=null;offFixes=0;saveNav();drawRoute();updNav();
    if(first&&Date.now()-navTouched>20000)fitNav(false);   // 道順が見えるように（地図を触った直後は動かさない）
  },function(e){
    routeBusy=false;if(seq!==routeSeq||!nav)return;
    var code=e&&e.error;   // 取り直しに失敗しても、前の道順はそのまま使う
    routeErr=e&&e._net?{key:"routeOffline"}:code==="no_route"?{key:"routeNone",perm:true}:code==="too_far"?{key:"routeFar",perm:true}:{key:"routeFail"};
    routeErr.tk=navTargetKey();
    drawNavBar();
  });
  drawNavBar();
}
window.addEventListener("online",function(){if(nav){routeAt=0;updNav()}});   // つながったら、すぐ道順を取りに行く
// 編集中のピンがあれば確認してから、ナビを始める
function navGo(tg){
  var go=function(){closeSheet();startNav(tg)};
  if($("sheet")&&isDirty())confirmDiscard("close",go);else go();
}
// 隊へのナビ：位置を取得するたび（10秒ごと）に、相手の新しい位置へ目的地を動かす。
// 相手が位置共有をやめた・圏外のときは、最後に分かった位置のまま（「相手の位置：○分前」が増えていく）
function navTeamUpdate(){
  if(!nav||!nav.posId)return;
  var p=teamPos.filter(function(x){return x.id===nav.posId})[0];
  if(!p||(p.t===nav.posT&&p.lat===nav.lat&&p.lng===nav.lng))return;
  nav.lat=p.lat;nav.lng=p.lng;nav.posT=p.t;S.set(navKey(),nav);
  if(navTgt)navTgt.setLatLng([p.lat,p.lng]);
  if(useRoute())drawRoute();
  if(navArrived&&navPos&&distM(navPos,nav)>40)navArrived=false;   // 相手が離れたら、また到着を知らせる
  updNav();
  if(Date.now()-navTouched>20000)fitNav(false);   // 相手が画面の外に出たら、自分と相手が両方見えるように（地図を触った直後は動かさない）
}
// 地図の長押し（パソコンは右クリック）→ その地点へナビ／ピンを設置
function popAt(ll,el,off){
  var tl=$$(".tl")[0],top=tl?tl.offsetTop+tl.offsetHeight+12:80;   // 左上の表示・右のボタンに隠れない位置に出す
  L.popup({offset:[0,-(off||0)],maxWidth:260,autoPan:true,autoPanPaddingTopLeft:L.point(12,top),autoPanPaddingBottomRight:L.point(64,16)})
    .setLatLng(ll).setContent(el).openOn(map);
}
function navToPoint(ll){
  navGo({lat:ll.lat,lng:ll.lng,name:"",pt:1});
  api("GET","/api/reverse?lat="+ll.lat+"&lng="+ll.lng+"&lang="+lang).then(function(r){   // 住所が分かれば、目的地の名前にする（圏外なら「地図上の地点」のまま）
    if(nav&&nav.pt&&nav.lat===ll.lat&&nav.lng===ll.lng&&r&&r.label){nav.name=r.label;S.set(navKey(),nav);drawNavBar()}
  },function(){});
}
var lastLong=0;
map.on("contextmenu",function(e){
  if(!user||placing||vplacing||Date.now()-lastLong<800)return;   // 端末によっては長押しが2回届くので、1回にまとめる
  lastLong=Date.now();
  var ll=wrapLL(e.latlng),el=document.createElement("div");el.className="fac-pop";
  el.innerHTML='<small>'+esc(t("ptTitle"))+'</small><b class="mono">'+ll.lat.toFixed(5)+', '+ll.lng.toFixed(5)+'</b>'+
    '<button type="button" class="solid" data-nav="1">'+esc(t("navGo"))+'</button><button type="button" data-pin="1">'+esc(t("facPin"))+'</button>';
  el.querySelector("[data-nav]").onclick=function(){map.closePopup();navToPoint(ll)};
  el.querySelector("[data-pin]").onclick=function(){
    map.closePopup();
    var go=function(){closeSheet();openSheet(blank(ll))};
    if($("sheet")&&isDirty())confirmDiscard("move",go);else go();
  };
  popAt(e.latlng,el,0);
});

/* ---------- オフライン用に地図を保存（国土地理院の地図のみ） ----------
 * OpenStreetMap のタイルは、規約で一括ダウンロード（オフライン用の先読み）が禁止されているため保存しない。
 * 保存先は service worker と共通の Cache Storage（tiles-saved-v1）。古い順に消される「見た地図」とは別に保存し、消えないようにする。
 */
var SAVED_CACHE="tiles-saved-v1",SAVE_MAX=2500,SAVE_ZMAX=18;
var SAVE_LAYERS={
  std:{url:"https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",kb:18,key:"layerStd"},
  pale:{url:"https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",kb:14,key:"layerPale"},
  photo:{url:"https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",kb:40,key:"layerPhoto"}
};
function lon2x(lng,z){return Math.floor((lng+180)/360*Math.pow(2,z))}
function lat2y(lat,z){var r=lat*Math.PI/180;return Math.floor((1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*Math.pow(2,z))}
function tilesFor(b,z){
  var n=Math.pow(2,z),x0=Math.max(0,lon2x(b.getWest(),z)),x1=Math.min(n-1,lon2x(b.getEast(),z)),
      y0=Math.max(0,lat2y(b.getNorth(),z)),y1=Math.min(n-1,lat2y(b.getSouth(),z));
  return{x0:x0,x1:x1,y0:y0,y1:y1,n:(x1-x0+1)*(y1-y0+1)};
}
// 今の表示範囲を、最大の拡大（18）まで保存する。
// 今より縮小した倍率は、圏外で縮小したときに画面いっぱいに地図が出るよう、その倍率で見える広さで保存する（枚数はわずか）。
// 枚数が多すぎるときは、最大の拡大を下げる。
function planSave(){
  var b=map.getBounds(),zNow=Math.min(Math.round(map.getZoom()),SAVE_ZMAX),zMin=Math.max(10,zNow-4),zMax=SAVE_ZMAX;
  var bz=function(z){return z<zNow?b.pad((Math.pow(2,zNow-z)-1)/2):b};
  var count=function(z1){var s=0;for(var z=zMin;z<=z1;z++)s+=tilesFor(bz(z),z).n;return s};
  while(zMax>zNow&&count(zMax)>SAVE_MAX)zMax--;
  var n=count(zMax);
  return{b:b,bz:bz,zMin:zMin,zMax:zMax,n:n,limited:zMax<SAVE_ZMAX,tooBig:n>SAVE_MAX};
}
function savedMeta(){return S.get("ss_saved_maps")||[]}
function savedSummary(){
  if(!window.caches)return Promise.resolve({n:0});
  return caches.open(SAVED_CACHE).then(function(c){return c.keys()}).then(function(k){return{n:k.length}},function(){return{n:0}});
}
var saving=null;   // 保存中の状態（中止できるように）
function closeOff(){if(saving)saving.cancel=true;var el=$("offm");if(el)el.remove()}
function openOff(){
  closeOff();
  var lay=SAVE_LAYERS[baseKey]?baseKey:"std";
  var el=document.createElement("div");el.className="modal vm offm";el.id="offm";
  el.innerHTML='<div class="box" role="dialog" aria-modal="true" aria-labelledby="offT"><h1 id="offT">'+esc(t("offTitle"))+'</h1>'+
    '<p class="sec-empty" style="margin-top:0">'+esc(t("offHelp"))+'</p>'+
    '<label>'+esc(t("offLayer"))+'</label><div class="seg" id="offLay">'+Object.keys(SAVE_LAYERS).map(function(k){return '<button type="button" data-l="'+k+'"'+(k===lay?' class="on"':'')+'>'+esc(t(SAVE_LAYERS[k].key))+'</button>'}).join("")+'</div>'+
    '<p class="off-est" id="offEst"></p><progress id="offProg" class="hide" max="1" value="0"></progress><div class="adm-msg" id="offMsg" role="status"></div>'+
    '<div class="mrow"><button type="button" id="offX">'+esc(t("close"))+'</button><button type="button" class="solid" id="offGo">'+esc(t("offStart"))+'</button></div>'+
    '<h2 style="font-size:14px;margin:18px 0 4px">'+esc(t("offSavedH"))+'</h2><div class="off-saved" id="offSaved"></div></div>';
  document.body.appendChild(el);
  var plan=planSave();
  var est=function(){
    var L0=SAVE_LAYERS[lay],mb=Math.max(1,Math.round(plan.n*L0.kb/1024));
    $("offEst").textContent=plan.tooBig?t("offTooBig"):t("offEstimate",{n:plan.n.toLocaleString(),mb:mb,z1:plan.zMin,z2:plan.zMax})+(plan.limited?" "+t("offLimited",{z:plan.zMax}):"");
    $("offGo").disabled=plan.tooBig||!window.caches;
  };
  var showSaved=function(){
    savedSummary().then(function(s){
      var areas=savedMeta().length;
      var box=$("offSaved");if(!box)return;
      box.innerHTML='<div>'+esc(s.n?t("offSavedN",{a:areas,n:s.n.toLocaleString()}):t("offNone"))+'</div>'+(s.n?'<button type="button" class="del" id="offClr">'+esc(t("offClear"))+'</button>':'');
      if($("offClr"))$("offClr").onclick=function(){
        var b=this;if(b.getAttribute("data-armed")){caches["delete"](SAVED_CACHE).then(function(){S.set("ss_saved_maps",[]);showSaved();offMsg(t("deleted"),true)});return}
        b.setAttribute("data-armed","1");b.textContent=t("rmConfirm");
      };
    });
  };
  var offMsg=function(m,ok){var x=$("offMsg");if(x){x.textContent=m||"";x.classList.toggle("ok",!!ok)}};
  est();showSaved();
  if(!navigator.onLine)offMsg(t("offNeedNet"));
  $("offLay").onclick=function(e){var b=e.target.closest("[data-l]");if(!b||saving)return;lay=b.getAttribute("data-l");
    Array.prototype.forEach.call(this.children,function(x){x.classList.toggle("on",x===b)});est()};
  var onKey=function(e){if(e.key==="Escape"){e.preventDefault();done()}};
  var done=function(){document.removeEventListener("keydown",onKey);closeOff()};
  document.addEventListener("keydown",onKey);
  $("offX").onclick=done;
  $("offGo").onclick=function(){
    if(saving){saving.cancel=true;return}
    if(!navigator.onLine)return offMsg(t("offNeedNet"));
    var urls=[],tpl=SAVE_LAYERS[lay].url;
    for(var z=plan.zMin;z<=plan.zMax;z++){var r=tilesFor(plan.bz(z),z);
      for(var x=r.x0;x<=r.x1;x++)for(var y=r.y0;y<=r.y1;y++)urls.push(tpl.replace("{z}",z).replace("{x}",x).replace("{y}",y))}
    var st=saving={cancel:false,done:0,fail:0,n:urls.length};
    $("offGo").textContent=t("offCancel");$("offProg").classList.remove("hide");$("offProg").max=urls.length;
    Array.prototype.forEach.call($("offLay").children,function(x){x.disabled=true});
    if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()["catch"](function(){});   // 端末の容量が少なくなっても消されにくくする
    caches.open(SAVED_CACHE).then(function(cache){
      var i=0;
      var one=function(u){
        return cache.match(u).then(function(hit){
          if(hit)return;
          return caches.match(u).then(function(other){   // 「見た地図」に既にあれば、それを写す
            if(other)return cache.put(u,other);
            return fetch(u,{mode:"cors",credentials:"omit"}).then(function(res){if(!res.ok)throw res;return cache.put(u,res)})
              ["catch"](function(){return fetch(u,{mode:"no-cors"}).then(function(res){return cache.put(u,res)})});
          });
        })["catch"](function(){st.fail++});
      };
      var worker=function(){   // 同時に3枚まで。サーバーに負担をかけないよう少し間をあける
        if(st.cancel||i>=urls.length)return Promise.resolve();
        var u=urls[i++];
        return one(u).then(function(){st.done++;var p=$("offProg");if(p)p.value=st.done;offMsg(t("offProgress",{done:st.done.toLocaleString(),n:st.n.toLocaleString()}),true)})
          .then(function(){return new Promise(function(r){setTimeout(r,40)})}).then(worker);
      };
      return Promise.all([worker(),worker(),worker()]);
    }).then(function(){
      saving=null;
      if(!$("offm"))return;
      $("offGo").textContent=t("offStart");$("offProg").classList.add("hide");
      Array.prototype.forEach.call($("offLay").children,function(x){x.disabled=false});
      if(st.cancel){offMsg(t("offCancelled",{n:st.done.toLocaleString()}));showSaved();return}
      var m=savedMeta();m.push({layer:lay,zMin:plan.zMin,zMax:plan.zMax,n:st.n,t:Date.now(),
        b:(function(o){return[o.getSouth(),o.getWest(),o.getNorth(),o.getEast()]})(plan.bz(plan.zMin)).map(function(v){return Math.round(v*1e5)/1e5})});
      S.set("ss_saved_maps",m.slice(-30));
      var msg=t("offDone",{n:(st.n-st.fail).toLocaleString()})+(st.fail?" "+t("offFailN",{n:st.fail}):"");
      if(baseKey!==lay){setBase(lay);renderLayerSelect();msg+=" "+t("offSwitched",{layer:t(SAVE_LAYERS[lay].key)})}
      offMsg(msg,!st.fail);showSaved();
    },function(){saving=null;offMsg(t("admFail"))});
  };
}
$("zs").onclick=openOff;

var tt;function toast(m,ms){var x=document.querySelector(".toast");if(x)x.remove();x=document.createElement("div");x.className="toast";x.textContent=m;$("stage").appendChild(x);clearTimeout(tt);tt=setTimeout(function(){x.remove()},ms||2200)}

/* ---------- テーマ・共有 ---------- */
var th0=S.get("ss_theme");if(th0)document.documentElement.setAttribute("data-theme",th0);
$("th").onclick=function(){var r=document.documentElement,dk=getComputedStyle(r).getPropertyValue("--bg").trim()==="#1c1b17",n=dk?"light":"dark";r.setAttribute("data-theme",n);S.set("ss_theme",n);render()};
var shareOpen=function(){
  var url=location.origin+location.pathname;$("su").value=url;
  var box=$("qrbox");box.innerHTML="";
  try{new QRCode(box,{text:url,width:180,height:180,correctLevel:QRCode.CorrectLevel.M})}
  catch(e){box.textContent=t("qrFail")}
  $("modal").classList.remove("hide");
};
$("zq").onclick=shareOpen;$("shA").onclick=shareOpen;
$("sx").onclick=function(){$("modal").classList.add("hide")};
$("modal").addEventListener("click",function(e){if(e.target===this)this.classList.add("hide")});
$("su").onclick=function(){this.select()};
$("sc").onclick=function(){var b=this,i=$("su");i.select();
  var ok=function(){b.textContent=t("copied");setTimeout(function(){b.textContent=t("copy")},1500)};
  try{navigator.clipboard.writeText(i.value).then(ok,function(){try{document.execCommand("copy")&&ok()}catch(e){}})}catch(e){try{document.execCommand("copy")&&ok()}catch(_){}}};

/* ---------- boot ---------- */
// オフラインでもアプリを開けるように service worker を登録（sw.js）
if("serviceWorker" in navigator&&/^https?:$/.test(location.protocol)){
  window.addEventListener("load",function(){navigator.serviceWorker.register("/sw.js")["catch"](function(){})});
}
applyI18n();
var ses=S.get("ss_session");
var invParam=new URLSearchParams(location.search).get("invite");
if(invParam&&!(ses&&ses.token)){setMode("reg");$("inv").value=fmtCode(invParam.toUpperCase().replace(/[^A-Z0-9]/g,""))}
if(invParam&&history.replaceState)history.replaceState(null,"",location.pathname);   // URLからコードを消しておく
if(ses&&ses.token){enter(ses)}
})();
