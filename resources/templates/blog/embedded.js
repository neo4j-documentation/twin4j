module.exports = ({ node, opts }) => `<div id="content">
${node.getContent()}
<style type="text/css">
  .imageblock.right {
    float: right;
    padding: 2px;
    padding-left: 4px;
  }
  .image-heading {
    text-align: center;
  }
  .heading {
    font-size: .8em;
    line-height: 1.5em;
    text-align: center;
    font-weight: bold;
  }
  blockquote.tweet {
    background-color: #68bdf6;
    border-left: 5px solid #5ca8db;
    color: #ffffff
  }
  div.listingblock {
    margin-bottom: 1.5rem;
  }
</style>
</div>`
