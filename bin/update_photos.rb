require 'ex_twitter'

class Script
  CONFIG = YAML.load_file('config/twitter.yml')

  DEBUG = CONFIG['debug']

  NAMES =
    if DEBUG
      %w(0612kazuha)
    else
      %w(0612kazuha AgusuHerudi chantichanti22 juicyloveberry maroka1029
        mizuki_momoko momo_ninomiya ryoshihono s5hjvwyk shizaki_hinata suzukisakiika
        tomoe_0116 y_amamiya_y yoshida_saki yukakuramoti)
    end

  MAX_PAGINATES = DEBUG ? 1 : 3
  COUNT = DEBUG ? 30 : 100

  def run
    users = client.users(NAMES)
    photos = users.map { |user| fetch_photos(user) }.flatten

    puts photos.size
    puts photos.map { |p| p.attrs[:media_url] }

    json = photos.map { |p| {url: p.attrs[:media_url], link: p.attrs[:url]} }
    open('public/assets/json/cute.json', 'w') { |f| f.write(JSON.pretty_generate(json)) }
  end

  private

  def client
    @client ||= ExTwitter.new(CONFIG)
  end

  def fetch_photos(user)
    p = client.user_photos(user, {max_paginates: MAX_PAGINATES, count: COUNT})
    puts "#{user.screen_name}, #{p.size}"
    p
  rescue => e
    puts "#{e.inspect} #{user.screen_name}"
    puts e.backtrace[0, 5].join("\n")
    []
  end
end

if $0 == __FILE__
  Script.new.run
end
