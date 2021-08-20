'use strict'

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

module.exports = (uiModel) => {
  const date = uiModel.date
  const yyyy = date.getUTCFullYear()
  const month = monthNames[date.getUTCMonth()]
  const dd = ('0' + (date.getUTCDate())).slice(-2)
  let avatarStyle
  if (uiModel.avatarDataUris.length > 1) {
    avatarStyle = `
    .meta .avatar {
      width: 275px;
      height: 275px;
      border-radius: 100%;
      position: absolute;
    }

    .avatar0 {
      background-image: url(${uiModel.avatarDataUris[0]});
      background-position: center;
      background-size: cover;
      z-index: 1;
      top: 115px;
      margin-left: 0;
    }

    .avatar1 {
      background-image: url(${uiModel.avatarDataUris[1]});
      background-position: center;
      background-size: cover;
      top: 115px;
      margin-left: calc(22px + 205px);
      background-position-x: 25px;
    }`
  } else {
    avatarStyle = `
    .meta .avatar {
      width: 305px;
      height: 305px;
      border-radius: 100%;
      position: absolute;
      top: 95px;
      margin-left: 22px;
    }

    .avatar0 {
      background-image: url(${uiModel.avatarDataUris[0]});
      background-position: center;
      background-size: cover;
    }`
  }
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      margin: 0;
      color: white;
      font-family: "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
    }

    .author {
      font-size: 28px;
      font-weight: 600;
      display: block;
      padding-bottom: 0.5rem;
    }

    .byline .title {
      font-size: 17px;
      display: block;
    }

    .date {
      font-size: 17px;
    }

    main {
      background-image: url('${uiModel.backgroundDataUri}');
      width: 800px;
      height: 400px;
    }

    section {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    header {
      padding-left: 1rem;
      padding-top: 0.5rem;
    }

    footer {
      align-self: flex-end;
      margin-top: auto;
      margin-bottom: 20px;
      margin-right: 16px;
      text-align: right;
      width: 257px;
    }

    footer .title {
      font-size: 17.25px;
      font-weight: 600;
      margin-bottom: 20px;
      text-align: center;
    }
${avatarStyle}
  </style>
</head>
<body>
  <main>
    <section>
      <header>
        <div class="meta">
          <div class="byline">
            <span class="author">${uiModel.communityMembers.map((communityMember) => communityMember.name).join(' & ')}</span>
            <span class="title">${uiModel.communityMembers[0].title}</span>
          </div>
          <div class="avatar avatar0"></div>
          ${uiModel.communityMembers.length > 1 ? `<div class="avatar avatar1"></div>` : ''}
        </div>
      </header>
      <footer>
        <div class="title">Featured Community Member${uiModel.communityMembers.length > 1 ? 's' : ''}</div>
        <div class="date">
          ${month} ${dd}, ${yyyy}
        </div>
      </footer>
    </section>
  </main>
</body>`
}
