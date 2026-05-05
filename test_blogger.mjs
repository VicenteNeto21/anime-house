const fetchBlogger = async () => {
  const url = 'https://www.blogger.com/video.g?token=AD6v5dyXWZp2aXo8VWdZFY7f1PMLK6R21ntQtOcwj6zYKADxsAhDOCrwZ6PadpWHHORIoc27HFxeogfZAcZviK1_5hVCMqcwXisyvhcAJDcwxT0iclLQbLueMvVNpTU9GmpU2Id7cxg';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const match = html.match(/"play_url"\:"(.*?)"/);
  if (match) {
    console.log(match[1]);
  } else {
    console.log('No play_url found', html.substring(0, 500));
  }
};
fetchBlogger();
