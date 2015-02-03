require 'ex_twitter'

class PhotosUpdater
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

  def initialize(tweets = nil)
    @tweets = tweets
  end

  def run
    photos =
      if !@tweets.nil? && @tweets.any?
        @tweets.select{|t| t[:entities][:media].any? }.map{|t| t[:entities][:media] }.flatten
      else
        users = client.users(NAMES)
        users.map { |user| fetch_photos(user) }.flatten.map{|p| p.attrs }
      end

    puts photos.size
    puts photos.map { |p| p[:media_url] }

    json = photos.map do |p|
      {
        url: "#{p[:media_url]}:small",
        link: p[:expanded_url],
        status_id: p[:expanded_url].match(%r{status/(\d+)/photo})[1],
        photo_id: p[:id_str]
      }
    end
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
  PhotosUpdater.new.run
end
